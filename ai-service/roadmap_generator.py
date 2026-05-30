"""
Resumy API — Skill Roadmap Generator Router
Menggunakan Google Gemini (google-genai SDK) untuk menghasilkan
learning roadmap berbasis JSON terstruktur.
"""

import json
import logging
import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from google import genai
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Environment & Gemini configuration
# ---------------------------------------------------------------------------
load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if not GEMINI_API_KEY:
#     logger.warning(
#         "GEMINI_API_KEY tidak ditemukan di environment variables. "
#         "Endpoint /api/generate-roadmap tidak akan berfungsi."
#     )

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning(
        "GEMINI_API_KEY tidak ditemukan di environment variables. "
        "Endpoint /api/generate-roadmap tidak akan berfungsi."
    )

client = None

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# client = genai.Client(api_key=GEMINI_API_KEY)

client = None

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# Gemini model & prompt config
# ---------------------------------------------------------------------------
MODEL_NAME = "gemini-2.0-flash"

SYSTEM_INSTRUCTION = (
    "You are an expert Technical Recruiter and Career Coach specializing in IT roles. "
    "Given a target job title, the candidate's current skills, and their missing skills, "
    "generate a detailed, actionable, step-by-step learning roadmap in JSON format.\n\n"
    "The JSON output MUST follow this exact structure:\n"
    "{\n"
    '  "job_title": "<target job title>",\n'
    '  "summary": "<brief 1-2 sentence overview of the roadmap>",\n'
    '  "total_estimated_weeks": <number>,\n'
    '  "roadmap": [\n'
    "    {\n"
    '      "step": <step number>,\n'
    '      "skill": "<skill to learn>",\n'
    '      "priority": "<high | medium | low>",\n'
    '      "estimated_weeks": <number>,\n'
    '      "learning_resources": [\n'
    '        {"type": "<course | documentation | project | book>", "name": "<resource name>", "url": "<URL or N/A>"}\n'
    "      ],\n"
    '      "milestone": "<concrete deliverable or proof-of-skill to achieve>"\n'
    "    }\n"
    "  ]\n"
    "}\n\n"
    "Rules:\n"
    "- Order steps logically — foundational skills first, advanced skills later.\n"
    "- Prioritize missing skills that are most critical for the target role as 'high'.\n"
    "- Include at least 2 learning resources per skill.\n"
    "- Keep milestones specific and measurable.\n"
    "- Output ONLY valid JSON, no markdown, no extra text."
)

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic schema
# ---------------------------------------------------------------------------
class RoadmapRequest(BaseModel):
    """Body request untuk endpoint /api/generate-roadmap."""

    job_title: str
    current_skills: str
    missing_skills: str


# ---------------------------------------------------------------------------
# Fallback dummy data (API Mocking untuk frontend)
# ---------------------------------------------------------------------------
FALLBACK_ROADMAP = {
    "job_title": "Machine Learning Engineer",
    "roadmap": [
        {
            "step": 1,
            "skill": "FastAPI",
            "description": "Learn how to build REST APIs for ML models.",
            "estimated_weeks": 2,
            "recommended_resource": "FastAPI official docs",
        },
        {
            "step": 2,
            "skill": "Docker",
            "description": "Containerize your ML endpoints for deployment.",
            "estimated_weeks": 2,
            "recommended_resource": "Docker for Beginners",
        },
    ],
}


# ---------------------------------------------------------------------------
# Endpoint: POST /api/generate-roadmap
# ---------------------------------------------------------------------------
@router.post("/api/generate-roadmap")
async def generate_roadmap(payload: RoadmapRequest):
    """Menghasilkan learning roadmap terstruktur menggunakan Gemini AI.

    Jika Gemini API gagal (quota/rate-limit), endpoint akan mengembalikan
    data dummy (mock) agar tim frontend tidak terblokir.
    """

    # Guard — pastikan API key tersedia
    # if not GEMINI_API_KEY:
    #     raise HTTPException(
    #         status_code=503,
    #         detail="GEMINI_API_KEY belum dikonfigurasi. Tambahkan ke file .env.",
    #     )

    if client is None:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY belum dikonfigurasi. Tambahkan ke file .env.",
    )

    # Validasi input tidak kosong
    if (
        not payload.job_title.strip()
        or not payload.current_skills.strip()
        or not payload.missing_skills.strip()
    ):
        raise HTTPException(
            status_code=422,
            detail="Semua field (job_title, current_skills, missing_skills) wajib diisi.",
        )

    # Konstruksi prompt
    user_prompt = (
        f"Target Job Title: {payload.job_title}\n"
        f"Candidate's Current Skills: {payload.current_skills}\n"
        f"Missing / Gap Skills: {payload.missing_skills}\n\n"
        "Generate the step-by-step learning roadmap in JSON."
    )

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                temperature=0.7,
            ),
        )

        # Parse respons JSON dari Gemini
        roadmap_data = json.loads(response.text)

        return {
            "success": True,
            "source": "gemini",
            "data": roadmap_data,
        }

    except json.JSONDecodeError as exc:
        logger.error("Gemini response bukan JSON valid: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Respons dari Gemini bukan JSON yang valid. Coba lagi.",
        ) from exc

    except Exception as exc:
        logger.warning(
            "Gemini API gagal (%s). Mengembalikan data mock fallback.", exc
        )
        return {
            "success": True,
            "source": "mock_fallback",
            "data": FALLBACK_ROADMAP,
        }