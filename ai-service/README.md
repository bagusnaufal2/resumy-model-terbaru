# ResuMy AI service

This service loads the NER skill extraction model and MicroMLP ATS scorer
exported by the Colab notebooks, then exposes them to the Node backend.
It also provides a roadmap generator endpoint that calls OpenRouter.

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

The current `.keras` exports were saved with a Keras 3.x release. Create this service
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

## Roadmap generator

The roadmap generator is available at:

```text
POST /api/generate-roadmap
```

It expects a target role and uses OpenRouter to generate a structured learning
roadmap. The endpoint only accepts IT or technology-related roles.

Required environment variables:

```env
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=your-model
AI_SERVICE_ALLOWED_ORIGINS=http://127.0.0.1:5000
```

If OpenRouter fails or returns an invalid response, the endpoint returns an
error message instead of mock or fallback roadmap data.

## Production note

In production, keep this AI service private and let the Node backend call it.
Run it on localhost when it is deployed on the same server as the backend:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```
