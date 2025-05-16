# How to convert SONICS models to ONNX format

```zsh
poetry install --no-root
poetry run python convert_to_onnx.py [--model_id <Hugging Face model ID>] [--output_path <path>]
```

The converted model is saved as `sonics-onnx-converter/exports/sonics_model.onnx` if nothing is specified for `--output_path`.

Copy it to `src/public` manually to use it in the extension.
