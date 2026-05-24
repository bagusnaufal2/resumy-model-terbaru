export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
source ~/resumy-model-terbaru/ai-service/venv/bin/activate
cd ~/resumy-model-terbaru/ai-service
uvicorn main:app --host 0.0.0.0 --port 8000
