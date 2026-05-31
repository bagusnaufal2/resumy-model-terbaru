import os
from google import genai

# Ganti baris os.environ.get dengan teks key kamu langsung
client = genai.Client(api_key="AQ.Ab8RN6LT5Of69PDgDSShvo4-8eQ1SYR6aT73rmNOPmXEJGGiGA")
response = client.models.generate_content(
    model='gemini-2.5-flash',  # <-- Ubah ke versi ini
    contents='Halo!',
)
print(response.text)