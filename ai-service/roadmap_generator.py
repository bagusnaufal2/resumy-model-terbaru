"""
Roadmap generator for ResuMy.

This endpoint uses OpenRouter to create a learning roadmap based on the
user's target role.
"""

import json
import logging
import os
import re
from urllib import error, request

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_REFERER = os.getenv("OPENROUTER_REFERER", "http://localhost:5173")
OPENROUTER_TITLE = os.getenv("OPENROUTER_TITLE", "ResuMy Roadmap Generator")
ROLE_TOKEN_PATTERN = re.compile(r"[a-z0-9+#.]+")

IT_ROLE_KEYWORDS = {
    "ai",
    "ai engineer",
    "ai researcher",
    "algorithm",
    "analytics",
    "api",
    "app",
    "android",
    "application",
    "application security",
    "ar",
    "automation",
    "aws",
    "azure",
    "backend",
    "back end",
    "bi",
    "big data",
    "business intelligence",
    "blockchain",
    "business analyst",
    "c#",
    "c++",
    "cloud engineer",
    "cloud architect",
    "cloud",
    "cms",
    "computer",
    "computer science",
    "computer vision",
    "cyber",
    "cyber security",
    "cybersecurity",
    "data",
    "data analyst",
    "data architect",
    "data engineer",
    "data science",
    "data scientist",
    "database",
    "database administrator",
    "dba",
    "deep learning",
    "dev ops",
    "devsecops",
    "devops",
    "developer",
    "digital product",
    "docker",
    "embedded",
    "engineering manager",
    "erp",
    "ethical hacker",
    "flutter",
    "frontend",
    "front end",
    "fullstack",
    "full stack",
    "game",
    "game developer",
    "gcp",
    "golang",
    "help desk",
    "helpdesk",
    "informatika",
    "information security",
    "information system",
    "information systems",
    "information technology",
    "infrastructure",
    "internet of things",
    "ios developer",
    "ios",
    "iot",
    "it",
    "it auditor",
    "it business analyst",
    "it consultant",
    "it governance",
    "it helpdesk",
    "it infrastructure",
    "it project manager",
    "it security",
    "it support",
    "it system",
    "java",
    "javascript",
    "jaringan",
    "kecerdasan buatan",
    "keamanan siber",
    "kotlin",
    "kubernetes",
    "laravel",
    "linux",
    "llm",
    "low code",
    "machine learning",
    "microservices",
    "ml",
    "ml engineer",
    "mlops",
    "mobile",
    "mobile developer",
    "network administrator",
    "network engineer",
    "network",
    "networking",
    "nlp",
    "noc",
    "no code",
    "node",
    "node.js",
    "penetration tester",
    "pentester",
    "php",
    "platform",
    "product analyst",
    "product designer",
    "product manager",
    "product owner",
    "programmer",
    "prompt engineer",
    "python",
    "qa",
    "qa analyst",
    "qa automation",
    "qa engineer",
    "quality assurance",
    "react",
    "robotics",
    "rpa",
    "sap",
    "scrum master",
    "security",
    "security analyst",
    "security engineer",
    "site reliability",
    "solution architect",
    "solutions architect",
    "soc",
    "software",
    "software architect",
    "software engineer",
    "sre",
    "swift",
    "system analyst",
    "system administrator",
    "systems analyst",
    "tech lead",
    "technical analyst",
    "technical consultant",
    "technical project manager",
    "technical product",
    "technical recruiter",
    "technical support",
    "technical writer",
    "teknologi informasi",
    "tester",
    "typescript",
    "ui",
    "ui designer",
    "ui ux",
    "ux",
    "ux designer",
    "virtual reality",
    "vr",
    "web",
    "web3",
    "web developer",
    "wordpress",
}

if not OPENROUTER_API_KEY:
    logger.warning(
        "OPENROUTER_API_KEY was not found in environment variables. "
        "Endpoint /api/generate-roadmap will not work."
    )

SYSTEM_INSTRUCTION = (
    "You are an expert Technical Recruiter and Career Coach specializing in IT roles. "
    "Only generate roadmaps for roles in IT, software, data, AI/ML, cybersecurity, "
    "cloud, infrastructure, networking, QA, UI/UX, ERP, IoT, automation, "
    "technical support, or digital product fields. "
    "Given a target role, generate a practical beginner-friendly step-by-step "
    "learning roadmap in JSON format.\n\n"
    "The JSON output MUST follow this exact structure:\n"
    "{\n"
    '  "target_role": "<target role>",\n'
    '  "summary": "<brief 1-2 sentence overview of the roadmap>",\n'
    '  "total_estimated_weeks": <number>,\n'
    '  "roadmap": [\n'
    "    {\n"
    '      "step": <step number>,\n'
    '      "skill": "<skill to learn>",\n'
    '      "priority": "<HIGH | MEDIUM | LOW>",\n'
    '      "estimated_weeks": <number>,\n'
    '      "learning_resources": [\n'
    '        {"type": "<course | documentation | project | book>", "name": "<resource name>", "url": "<URL or N/A>"}\n'
    "      ],\n"
    '      "milestone": "<concrete deliverable or proof-of-skill to achieve>"\n'
    "    }\n"
    "  ]\n"
    "}\n\n"
    "Rules:\n"
    "- Order steps logically, from fundamentals to portfolio-ready skills.\n"
    "- Assume the learner is starting from a junior or beginner level unless stated otherwise.\n"
    "- Prioritize foundational skills as 'high' and advanced skills as 'medium' or 'low'.\n"
    "- Include at least 2 learning resources per skill.\n"
    "- Keep milestones specific and measurable.\n"
    "- Reject non-IT roles; never generate roadmaps for health, culinary, legal, "
    "finance, education, or other non-technology careers.\n"
    "- Output ONLY valid JSON, no markdown, no extra text."
)

router = APIRouter()


class RoadmapRequest(BaseModel):
    """Request body for the roadmap generator.

    `job_title` is still accepted as a fallback so older payloads do not
    break immediately, but the new flow uses `target_role`.
    """

    target_role: str | None = Field(default=None, min_length=1)
    job_title: str | None = Field(default=None, min_length=1)

    def resolved_target_role(self) -> str:
        return str(self.target_role or self.job_title or "").strip()


def normalize_role_text(text: str) -> str:
    return " ".join(ROLE_TOKEN_PATTERN.findall(str(text).lower()))


def is_it_related_role(target_role: str) -> bool:
    normalized_role = normalize_role_text(target_role)

    if not normalized_role:
        return False

    role_tokens = set(normalized_role.split())

    for keyword in IT_ROLE_KEYWORDS:
        if " " in keyword and keyword in normalized_role:
            return True

        if keyword in role_tokens:
            return True

    return False


FALLBACK_ROADMAP = {
    "target_role": "Frontend Developer",
    "summary": (
        "This roadmap helps you build frontend fundamentals and become ready "
        "to work on relevant portfolio projects."
    ),
    "total_estimated_weeks": 12,
    "roadmap": [
        {
            "step": 1,
            "skill": "HTML, CSS, and responsive layout",
            "priority": "high",
            "estimated_weeks": 3,
            "learning_resources": [
                {
                    "type": "documentation",
                    "name": "MDN HTML Basics",
                    "url": "https://developer.mozilla.org/",
                },
                {
                    "type": "project",
                    "name": "Build a responsive landing page",
                    "url": "N/A",
                },
            ],
            "milestone": "Build a responsive landing page without copying a template.",
        },
        {
            "step": 2,
            "skill": "JavaScript and DOM manipulation",
            "priority": "high",
            "estimated_weeks": 4,
            "learning_resources": [
                {
                    "type": "documentation",
                    "name": "MDN JavaScript Guide",
                    "url": "https://developer.mozilla.org/",
                },
                {
                    "type": "project",
                    "name": "Build a to-do app with filtering",
                    "url": "N/A",
                },
            ],
            "milestone": "Build an interactive app with dynamic UI updates and local state.",
        },
        {
            "step": 3,
            "skill": "React and API integration",
            "priority": "medium",
            "estimated_weeks": 5,
            "learning_resources": [
                {
                    "type": "documentation",
                    "name": "React documentation",
                    "url": "https://react.dev/",
                },
                {
                    "type": "project",
                    "name": "Build a small dashboard using a public API",
                    "url": "N/A",
                },
            ],
            "milestone": "Publish a portfolio-ready React app that consumes an API.",
        },
    ],
}


@router.post("/api/generate-roadmap")
async def generate_roadmap(payload: RoadmapRequest):
    """Generate a structured learning roadmap using OpenRouter.

    If the API fails, this endpoint returns a fallback roadmap so the
    frontend can still display a result.
    """

    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY is not configured. Add it to the .env file.",
        )

    target_role = payload.resolved_target_role()

    if not target_role:
        raise HTTPException(
            status_code=422,
            detail="Field target_role is required.",
        )

    if not is_it_related_role(target_role):
        raise HTTPException(
            status_code=422,
            detail=(
                "Roadmaps are only available for IT or technology roles. "
                "Examples: Frontend Developer, Data Analyst, UI/UX Designer, "
                "Cyber Security Analyst, or IT Support."
            ),
        )

    user_prompt = (
        f"Target Role: {target_role}\n\n"
        "First confirm the role is in the IT or technology field. "
        "Then generate a practical step-by-step learning roadmap in JSON."
    )

    try:
        payload = {
            "model": OPENROUTER_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_INSTRUCTION,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            "temperature": 0.7,
            "response_format": {"type": "json_object"},
        }

        api_request = request.Request(
            OPENROUTER_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": OPENROUTER_REFERER,
                "X-Title": OPENROUTER_TITLE,
            },
            method="POST",
        )

        with request.urlopen(api_request, timeout=45) as response:
            response_body = json.loads(response.read().decode("utf-8"))

        message = (
            response_body.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )

        roadmap_data = json.loads(message)
        roadmap_data.setdefault("target_role", target_role)

        return {
            "success": True,
            "source": "openrouter",
            "data": roadmap_data,
        }

    except json.JSONDecodeError as exc:
        logger.error("OpenRouter response was not valid JSON: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="OpenRouter returned invalid JSON. Please try again.",
        ) from exc

    except error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        logger.warning("OpenRouter HTTP error (%s): %s", exc.code, error_body)

        raise HTTPException(
            status_code=502,
            detail="OpenRouter request failed. Check the API key, model, or rate limit.",
        ) from exc

    except Exception as exc:
        logger.warning(
            "OpenRouter API failed (%s). Returning fallback data.", exc
        )

        fallback_data = {
            **FALLBACK_ROADMAP,
            "target_role": target_role,
        }

        return {
            "success": True,
            "source": "mock_fallback",
            "data": fallback_data,
        }
