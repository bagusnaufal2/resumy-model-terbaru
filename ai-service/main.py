from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.metrics.pairwise import cosine_similarity
from tensorflow.keras.models import load_model


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = BASE_DIR / "models" / "resumy_ner_skill_model.keras"
DEFAULT_ARTIFACT_PATH = (
    BASE_DIR / "models" / "resumy_ner_skill_artifacts.json"
)
DEFAULT_SCORER_MODEL_PATH = BASE_DIR / "models" / "resumy_micro_mlp.keras"
DEFAULT_TFIDF_PATH = BASE_DIR / "models" / "tfidf_vectorizer.pkl"
DEFAULT_SCALER_PATH = BASE_DIR / "models" / "scaler.pkl"
TOKEN_EDGE_PATTERN = re.compile(r"^[^a-z0-9+#.]+|[^a-z0-9+#.]+$", re.I)

DISPLAY_SKILL_NAMES = {
    "ai": "AI",
    "c#": "C#",
    "c++": "C++",
    "css": "CSS",
    "express js": "Express.js",
    "fastapi": "FastAPI",
    "git": "Git",
    "github": "GitHub",
    "html": "HTML",
    "javascript": "JavaScript",
    "keras": "Keras",
    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "nlp": "NLP",
    "node js": "Node.js",
    "numpy": "NumPy",
    "pandas": "Pandas",
    "postgresql": "PostgreSQL",
    "power bi": "Power BI",
    "python": "Python",
    "react": "React",
    "rest api": "REST API",
    "restful api": "RESTful API",
    "scikit learn": "Scikit-learn",
    "sklearn": "scikit-learn",
    "sql": "SQL",
    "tensorflow": "TensorFlow",
    "typescript": "TypeScript",
    "vite": "Vite",
}

# The notebook's final demo inference uses a curated skill set to avoid
# showing noisy NER spans such as dates, course titles, and generic phrases.
CURATED_SKILL_TERMS = {
    "aws",
    "azure",
    "c#",
    "c++",
    "cloud computing",
    "computer vision",
    "css",
    "data analysis",
    "data science",
    "data visualization",
    "deep learning",
    "docker",
    "excel",
    "express js",
    "express.js",
    "fastapi",
    "figma",
    "flask",
    "gcp",
    "git",
    "github",
    "html",
    "java",
    "javascript",
    "keras",
    "laravel",
    "machine learning",
    "microsoft access",
    "microsoft excel",
    "microsoft powerpoint",
    "microsoft word",
    "mongodb",
    "mysql",
    "natural language processing",
    "nlp",
    "node js",
    "node.js",
    "numpy",
    "pandas",
    "php",
    "postgresql",
    "power bi",
    "powerpoint",
    "python",
    "pytorch",
    "react",
    "rest api",
    "restful api",
    "scikit learn",
    "sklearn",
    "sql",
    "streamlit",
    "tableau",
    "tensorflow",
    "typescript",
    "vite",
    "word",
}

SKILL_ALIASES = {
    "express.js": "express js",
    "microsoft access": "microsoft access",
    "microsoft excel": "excel",
    "microsoft powerpoint": "powerpoint",
    "microsoft word": "word",
    "node.js": "node js",
}

DISPLAY_SKILL_NAMES.update(
    {
        "aws": "AWS",
        "azure": "Azure",
        "excel": "Excel",
        "gcp": "GCP",
        "microsoft access": "Microsoft Access",
        "php": "PHP",
        "powerpoint": "PowerPoint",
        "pytorch": "PyTorch",
        "word": "Microsoft Word",
    }
)


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(min_length=1)
    job_description: str = Field(min_length=1)


def get_configured_path(env_name: str, default_path: Path) -> Path:
    configured_path = os.getenv(env_name)
    return Path(configured_path).expanduser() if configured_path else default_path


def clean_token(token: str) -> str:
    return TOKEN_EDGE_PATTERN.sub("", str(token).lower().strip())


def tokenize(text: str) -> list[str]:
    tokens = []

    for token in str(text).split():
        cleaned = clean_token(token)
        if cleaned:
            tokens.append(cleaned)

    return tokens


def normalize_skill(skill: str) -> str:
    normalized = " ".join(tokenize(skill))
    return SKILL_ALIASES.get(normalized, normalized)


def display_skill(skill: str) -> str:
    normalized = normalize_skill(skill)

    if not normalized:
        return ""

    if normalized in DISPLAY_SKILL_NAMES:
        return DISPLAY_SKILL_NAMES[normalized]

    return " ".join(token.capitalize() for token in normalized.split())


def dedupe_skills(skills: list[str]) -> list[str]:
    unique_skills = []
    seen = set()

    for skill in skills:
        label = display_skill(skill)
        key = normalize_skill(label)

        if label and key not in seen:
            unique_skills.append(label)
            seen.add(key)

    return unique_skills


class SkillExtractor:
    def __init__(self, model_path: Path, artifact_path: Path) -> None:
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        if not artifact_path.exists():
            raise FileNotFoundError(f"Artifact file not found: {artifact_path}")

        with artifact_path.open("r", encoding="utf-8") as artifact_file:
            artifacts = json.load(artifact_file)

        self.model = load_model(model_path, compile=False)
        self.max_len = int(artifacts["max_len"])
        self.token_vocab = list(artifacts["token_vocab"])
        self.tag_vocab = list(artifacts["tag_vocab"])
        self.token_to_id = {
            token: index for index, token in enumerate(self.token_vocab)
        }
        self.pad_id = self.token_to_id.get(artifacts.get("pad_token", "[PAD]"), 0)
        self.unk_id = self.token_to_id.get(artifacts.get("unk_token", "[UNK]"), 1)
        self.dictionary_names = self._build_dictionary_names(CURATED_SKILL_TERMS)
        self.max_skill_ngram = min(
            max((len(skill.split()) for skill in self.dictionary_names), default=1),
            5,
        )

    @staticmethod
    def _build_dictionary_names(skills: list[str]) -> dict[str, str]:
        dictionary_names = {}

        for skill in skills:
            key = normalize_skill(skill)
            label = display_skill(skill)

            if key and label:
                dictionary_names[key] = label

        return dictionary_names

    def extract(self, text: str) -> list[str]:
        tokens = tokenize(text)

        if not tokens:
            return []

        rule_skills = self._extract_dictionary_skills(tokens)
        model_skills = self._filter_model_skills(self._extract_model_skills(tokens))
        return dedupe_skills(rule_skills + model_skills)

    def _filter_model_skills(self, skills: list[str]) -> list[str]:
        filtered_skills = []

        for skill in skills:
            key = normalize_skill(skill)

            if key in self.dictionary_names:
                filtered_skills.append(self.dictionary_names[key])

        return filtered_skills

    def _extract_model_skills(self, tokens: list[str]) -> list[str]:
        skills = []

        for start in range(0, len(tokens), self.max_len):
            chunk = tokens[start : start + self.max_len]
            encoded = np.full((1, self.max_len), self.pad_id, dtype=np.int32)
            encoded[0, : len(chunk)] = [
                self.token_to_id.get(token, self.unk_id) for token in chunk
            ]
            probabilities = self.model.predict(encoded, verbose=0)[0]
            tag_ids = np.argmax(probabilities, axis=-1)[: len(chunk)]
            tags = [
                self.tag_vocab[int(tag_id)]
                if int(tag_id) < len(self.tag_vocab)
                else "O"
                for tag_id in tag_ids
            ]
            skills.extend(self._tags_to_skills(chunk, tags))

        return skills

    @staticmethod
    def _tags_to_skills(tokens: list[str], tags: list[str]) -> list[str]:
        skills = []
        current_tokens = []

        def flush_current() -> None:
            if current_tokens:
                skills.append(" ".join(current_tokens))
                current_tokens.clear()

        for token, tag in zip(tokens, tags):
            if tag == "B-SKILL":
                flush_current()
                current_tokens.append(token)
            elif tag == "I-SKILL":
                current_tokens.append(token)
            else:
                flush_current()

        flush_current()
        return skills

    def _extract_dictionary_skills(self, tokens: list[str]) -> list[str]:
        skills = []
        index = 0

        while index < len(tokens):
            matched_skill = ""
            matched_length = 0

            for size in range(self.max_skill_ngram, 0, -1):
                candidate = " ".join(tokens[index : index + size])

                if candidate in self.dictionary_names:
                    matched_skill = self.dictionary_names[candidate]
                    matched_length = size
                    break

            if matched_skill:
                skills.append(matched_skill)
                index += matched_length
            else:
                index += 1

        return skills


class AtsScorer:
    def __init__(
        self, model_path: Path, tfidf_path: Path, scaler_path: Path
    ) -> None:
        for label, artifact_path in (
            ("MicroMLP model", model_path),
            ("TF-IDF vectorizer", tfidf_path),
            ("feature scaler", scaler_path),
        ):
            if not artifact_path.exists():
                raise FileNotFoundError(f"{label} file not found: {artifact_path}")

        self.model = load_model(model_path, compile=False)
        self.tfidf = joblib.load(tfidf_path)
        self.scaler = joblib.load(scaler_path)

    def score(self, resume_text: str, job_description: str) -> int:
        raw_features = self._extract_features(resume_text, job_description)
        scaled_features = self.scaler.transform(raw_features)
        prediction = self.model.predict(scaled_features, verbose=0)
        probability = float(np.ravel(prediction)[0])

        if not np.isfinite(probability):
            raise ValueError("MicroMLP returned an invalid score.")

        return round(float(np.clip(probability, 0.0, 1.0)) * 100)

    def _extract_features(
        self, resume_text: str, job_description: str
    ) -> np.ndarray:
        cv_text = str(resume_text)
        jd_text = str(job_description)
        cv_words = set(cv_text.lower().split())
        jd_words = set(jd_text.lower().split())
        union = len(cv_words | jd_words)
        cv_length = max(len(cv_text), 1)
        jd_length = max(len(jd_text), 1)
        cv_vector = self.tfidf.transform([cv_text])
        jd_vector = self.tfidf.transform([jd_text])

        features = np.zeros((1, 4), dtype=np.float32)
        features[0, 0] = len(cv_words & jd_words) / union if union else 0.0
        features[0, 1] = cv_length / jd_length
        features[0, 2] = abs(len(cv_words) - len(jd_words))
        features[0, 3] = cosine_similarity(cv_vector, jd_vector)[0, 0]
        return features


def build_improvements(
    score: int,
    resume_skills: list[str],
    job_skills: list[str],
    missing_skills: list[str],
) -> list[str]:
    improvements = []

    if not resume_skills:
        improvements.append(
            "Tambahkan bagian skill atau project yang menyebut skill teknis dengan jelas."
        )

    if not job_skills:
        improvements.append(
            "Gunakan job description yang lebih lengkap agar skill target dapat diekstrak."
        )

    if missing_skills:
        skill_preview = ", ".join(missing_skills[:4])
        improvements.append(
            f"Jika Anda memilikinya, tunjukkan bukti skill yang dicari lowongan: {skill_preview}."
        )

    if score < 70:
        improvements.append(
            "Sesuaikan ringkasan, pengalaman, dan project dengan kebutuhan lowongan."
        )

    improvements.append(
        "Tambahkan dampak terukur pada pengalaman atau project yang paling relevan."
    )
    return improvements[:4]


def analyze_texts(
    extractor: SkillExtractor,
    scorer: AtsScorer,
    resume_text: str,
    job_description: str,
) -> dict[str, object]:
    resume_skills = extractor.extract(resume_text)
    job_skills = extractor.extract(job_description)
    resume_skill_keys = {normalize_skill(skill) for skill in resume_skills}
    missing_skills = [
        skill for skill in job_skills if normalize_skill(skill) not in resume_skill_keys
    ]
    score = scorer.score(resume_text, job_description)

    return {
        "score": score,
        "skillsHave": resume_skills,
        "skillsMissing": missing_skills,
        "improvements": build_improvements(
            score, resume_skills, job_skills, missing_skills
        ),
    }


@lru_cache(maxsize=1)
def get_extractor() -> SkillExtractor:
    return SkillExtractor(
        get_configured_path("RESUMY_MODEL_PATH", DEFAULT_MODEL_PATH),
        get_configured_path("RESUMY_ARTIFACT_PATH", DEFAULT_ARTIFACT_PATH),
    )


@lru_cache(maxsize=1)
def get_scorer() -> AtsScorer:
    return AtsScorer(
        get_configured_path("RESUMY_SCORER_MODEL_PATH", DEFAULT_SCORER_MODEL_PATH),
        get_configured_path("RESUMY_TFIDF_PATH", DEFAULT_TFIDF_PATH),
        get_configured_path("RESUMY_SCALER_PATH", DEFAULT_SCALER_PATH),
    )


app = FastAPI(title="ResuMy ATS Analysis Service")


@app.get("/health")
def health() -> dict[str, object]:
    try:
        get_extractor()
        get_scorer()
    except Exception as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    return {"success": True, "message": "AI service is ready."}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest) -> dict[str, object]:
    try:
        return analyze_texts(
            get_extractor(),
            get_scorer(),
            payload.resume_text,
            payload.job_description,
        )
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=500, detail=f"AI analysis failed: {error}"
        ) from error
