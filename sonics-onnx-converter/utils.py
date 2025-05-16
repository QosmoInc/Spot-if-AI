import numpy as np


def extract_middle_chunk(audio: np.ndarray, sr: int, max_time: int) -> np.ndarray:
    chunk_samples = int(max_time * sr)
    total_chunks = len(audio) // chunk_samples
    middle_chunk_idx = total_chunks // 2

    start = middle_chunk_idx * chunk_samples
    end = start + chunk_samples
    chunk = audio[start:end]

    if len(chunk) < chunk_samples:
        chunk = np.pad(chunk, (0, chunk_samples - len(chunk)))

    return chunk
