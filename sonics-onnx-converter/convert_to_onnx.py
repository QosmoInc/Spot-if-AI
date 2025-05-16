import torch
from torch import nn
from sonics import HFAudioClassifier
import torchlibrosa as tl
from fire import Fire
import librosa
import torchaudio.transforms as T

ORIGINAL_SR = 44100
TARGET_SR = 16000


def convert_to_onnx(
    model_id: str = "awsaf49/sonics-spectttra-alpha-5s",
    output_path: str = "exports/sonics_model.onnx",
) -> None:
    print(f"Converting model {model_id}...")
    print(f"Downloading model from HuggingFace...")
    model = HFAudioClassifierProb.from_pretrained(model_id)
    model.eval()

    model = replace_melspec(model)

    max_time = model.config.audio.max_time
    dummy_input = torch.randn(1, ORIGINAL_SR * max_time)

    print(f"Exporting to onnx and saving to {output_path}...")
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        input_names=["audio"],
        output_names=["prob"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
    )


def replace_melspec(model: HFAudioClassifier) -> HFAudioClassifier:
    """
    Torchaudio's melspectrogram extractor has complex number operations which cannot be exported to the onnx format.
    To avoid the problem, this function replaces it with a custom implementation using TorchLibrosa.
    """

    model.ft_extractor.audio2melspec = Audio2MelspecTL(
        n_fft=model.config.melspec.n_fft,
        hop_length=model.config.melspec.hop_length,
        win_length=model.config.melspec.win_length,
        power=model.config.melspec.power,
        sr=model.config.audio.sample_rate,
        n_mels=model.config.melspec.n_mels,
        fmin=model.config.melspec.f_min,
        fmax=model.config.melspec.f_max,
    )

    return model


class HFAudioClassifierProb(HFAudioClassifier):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Resample from 44.1kHz (Spotify preview's sampling rate) to 16kHz (SONICS' sampling rate).
        # The parameters are set to reproduce the librosa's resampler, which is expected by the SONICS model.
        self.resampler = T.Resample(
            ORIGINAL_SR,
            TARGET_SR,
            lowpass_filter_width=128,
            rolloff=0.9475937167399596,
            resampling_method="kaiser_window",
            beta=14.769656459379492,
        )

    def forward(self, audio: torch.Tensor) -> torch.Tensor:
        audio = self.resampler(audio)

        logits = super().forward(audio)
        probs = torch.sigmoid(logits)

        return probs


class LogmelFilterBankHTK(tl.LogmelFilterBank):
    def __init__(
        self,
        sr=22050,
        n_fft=2048,
        n_mels=64,
        fmin=0.0,
        fmax=None,
        is_log=True,
        ref=1.0,
        amin=1e-10,
        top_db=80.0,
        freeze_parameters=True,
    ):
        super().__init__(
            sr, n_fft, n_mels, fmin, fmax, is_log, ref, amin, top_db, freeze_parameters
        )

        melW_librosa = librosa.filters.mel(
            sr=sr, n_fft=n_fft, n_mels=n_mels, fmin=fmin, fmax=fmax, htk=True, norm=None
        ).T

        self.melW = nn.Parameter(torch.Tensor(melW_librosa))

        if freeze_parameters:
            for param in self.parameters():
                param.requires_grad = False


class Audio2MelspecTL(torch.nn.Module):
    def __init__(self, n_fft, hop_length, win_length, power, sr, n_mels, fmin, fmax):
        super().__init__()

        self.melspec = torch.nn.Sequential(
            tl.Spectrogram(
                n_fft=n_fft,
                hop_length=hop_length,
                win_length=win_length,
                power=power,
            ),
            LogmelFilterBankHTK(
                sr=sr,
                n_mels=n_mels,
                fmin=fmin,
                fmax=fmax,
                is_log=False,
            ),
        )

    def forward(self, audio):
        return self.melspec(audio).squeeze(1).transpose(1, 2)


if __name__ == "__main__":
    Fire(convert_to_onnx)
