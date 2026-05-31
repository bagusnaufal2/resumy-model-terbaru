import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai


current_dir = Path(__file__).resolve().parent
env_path = current_dir / ".env"

load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("Isi variabel GEMINI_API_KEY setelah dimuat:", repr(GEMINI_API_KEY))

if not GEMINI_API_KEY:
    raise ValueError(
        "Waduh! GEMINI_API_KEY masih None. Periksa kembali isi file .env kamu, "
        "pastikan penulisan kuncinya adalah: GEMINI_API_KEY=AIzaSy..."
    )

client = genai.Client(api_key=GEMINI_API_KEY)
response = client.models.generate_content(
    model='gemini-2.5-flash',  
    contents='Halo!',
)
print(response.text)