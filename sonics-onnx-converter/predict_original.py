import librosa
from fire import Fire
from sonics import HFAudioClassifier
import torch

from utils import extract_middle_chunk


def load_model(
    model_id: str = "awsaf49/sonics-spectttra-alpha-5s",
) -> HFAudioClassifier:
    model = HFAudioClassifier.from_pretrained(model_id)
    model = model.to("cpu")
    model.eval()
    return model


def predict(
    audio_path: str, model_id: str = "awsaf49/sonics-spectttra-alpha-5s"
) -> None:
    model = load_model(model_id)
    max_time = model.config.audio.max_time

    audio, sr = librosa.load(audio_path, sr=16000)
    chunk = extract_middle_chunk(audio, sr, max_time)

    with torch.no_grad():
        chunk = torch.from_numpy(chunk).float().to("cpu")
        pred = model(chunk.unsqueeze(0))
        prob = torch.sigmoid(pred).cpu().numpy()[0]

    real_prob = (1 - prob).item()
    fake_prob = prob.item()

    print(f"Real Probability: {real_prob:.4f}")
    print(f"Fake Probability: {fake_prob:.4f}")


if __name__ == "__main__":
    Fire(predict)
