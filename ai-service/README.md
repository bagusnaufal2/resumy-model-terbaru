# ResuMy AI service

This service loads the NER skill extraction model and MicroMLP ATS scorer
exported by the Colab notebooks, then exposes them to the Node backend.

## Required model files

Place the NER files in `models`:

```text
models/resumy_ner_skill_model.keras
models/resumy_ner_skill_artifacts.json
```

Place the MicroMLP files in the same folder:

```text
models/resumy_micro_mlp.keras
models/tfidf_vectorizer.pkl
models/scaler.pkl
```

The notebooks create these artifacts in their configured export directories.
The training datasets are not required for serving inference.

The current `.keras` exports were saved with Keras 3.13.x. Create this service
environment with Python 3.12 or Python 3.13. Python 3.10 cannot install the
matching Keras version and Python 3.14 is outside the supported TensorFlow
wheel range used here.

## Run

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If the Windows Python launcher is unavailable, make sure `python --version`
prints Python 3.12.x or 3.13.x before creating the environment.

For Git Bash on Windows:

```bash
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend sends the extracted resume text and the pasted job description to
`POST /analyze`.
