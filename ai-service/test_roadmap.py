"""
Test script untuk endpoint /api/generate-roadmap
Menggunakan FastAPI TestClient untuk pengujian sinkron.
"""

import json
import sys

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_generate_roadmap():
    """Kirim request ke /api/generate-roadmap dan cetak hasilnya."""

    payload = {
        "job_title": "Machine Learning Engineer",
        "current_skills": "Python, Data Analysis, SQL",
        "missing_skills": "FastAPI, Docker, MLOps",
    }

    print("=" * 60)
    print("[>] Mengirim request ke POST /api/generate-roadmap ...")
    print(f"[PAYLOAD] {json.dumps(payload, indent=2)}")
    print("=" * 60)

    response = client.post("/api/generate-roadmap", json=payload)

    print(f"\n[STATUS] {response.status_code}")
    print("-" * 60)

    if response.status_code == 200:
        data = response.json()
        print("[OK] Response JSON:\n")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"[FAIL] Error: {response.text}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("[DONE] Test selesai!")
    print("=" * 60)


if __name__ == "__main__":
    test_generate_roadmap()