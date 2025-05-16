import librosa
from fire import Fire
import torch
from onnxruntime import InferenceSession

from utils import extract_middle_chunk


def predict(
    audio_path: str,
    model_path: str = "exports/sonics_model.onnx",
    max_time: int = 5,
    sr: int = 44100,
) -> None:
    sess = InferenceSession(model_path, providers=["CPUExecutionProvider"])

    audio, sr = librosa.load(audio_path, sr=sr)
    chunk = extract_middle_chunk(audio, sr, max_time)

    with torch.no_grad():
        chunk = torch.from_numpy(chunk).float().to("cpu")
        prob = sess.run(None, {"audio": chunk.unsqueeze(0).numpy()})[0][0]

    real_prob = (1 - prob).item()
    fake_prob = prob.item()

    print(f"Real Probability: {real_prob:.4f}")
    print(f"Fake Probability: {fake_prob:.4f}")


if __name__ == "__main__":
    Fire(predict)
