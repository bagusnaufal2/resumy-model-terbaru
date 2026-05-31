const DEFAULT_AI_SERVICE_URL = 'http://127.0.0.1:8000';
const DEFAULT_TIMEOUT_MS = 30000;

function createAIServiceError(message, statusCode = 502) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim()).filter(Boolean);
}

// Helper untuk menormalisasi output Analisis ATS CV
function normalizeAnalysis(data) {
  const numericScore = Number(data?.score);

  if (!Number.isFinite(numericScore)) {
    throw createAIServiceError('AI service returned an invalid score.');
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(numericScore))),
    skillsHave: normalizeStringArray(data.skillsHave),
    skillsMissing: normalizeStringArray(data.skillsMissing),
    improvements: normalizeStringArray(data.improvements),
  };
}

// Helper baru untuk menormalisasi output Roadmap dari Gemini Python
function normalizeRoadmap(body) {
  const roadmapData = body?.data;

  // Validasi apakah struktur data utama dari FastAPI Python valid
  if (!roadmapData || !Array.isArray(roadmapData.roadmap)) {
    throw createAIServiceError(
      'AI service returned an invalid roadmap structure.',
    );
  }

  return {
    jobTitle: roadmapData.job_title || '',
    summary: roadmapData.summary || '',
    totalEstimatedWeeks: Number(roadmapData.total_estimated_weeks) || 0,
    roadmap: roadmapData.roadmap.map((item) => ({
      step: Number(item.step) || 0,
      skill: String(item.skill || '').trim(),
      priority: String(item.priority || 'medium').trim(),
      estimatedWeeks: Number(item.estimated_weeks) || 0,
      learningResources: Array.isArray(item.learning_resources)
        ? item.learning_resources
        : [],
      milestone: String(item.milestone || '').trim(),
    })),
  };
}

function getAIServiceUrl() {
  return (process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL).replace(
    /\/$/,
    '',
  );
}

function getAIServiceTimeout() {
  const configuredTimeout = Number(process.env.AI_SERVICE_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;
}

// FITUR 1: Analisis ATS CV
export async function analyzeResumeWithAI({ resumeText, jobDescription }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getAIServiceTimeout());
  let response;

  try {
    response = await fetch(`${getAIServiceUrl()}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    const reason =
      error.name === 'AbortError'
        ? 'AI service timed out.'
        : 'AI service is not reachable. Start the Python AI service first.';
    throw createAIServiceError(reason);
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof body.detail === 'string'
        ? body.detail
        : 'AI service could not analyze this resume.';
    throw createAIServiceError(message);
  }

  return normalizeAnalysis(body);
}

// FITUR 2: Roadmap Generator (Menembak FastAPI Python Router)
export async function generateRoadmapWithAI({
  jobTitle,
  currentSkills,
  missingSkills,
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getAIServiceTimeout());
  let response;

  try {
    response = await fetch(`${getAIServiceUrl()}/api/generate-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_title: jobTitle,
        current_skills: Array.isArray(currentSkills)
          ? currentSkills.join(', ')
          : currentSkills,
        missing_skills: Array.isArray(missingSkills)
          ? missingSkills.join(', ')
          : missingSkills,
      }),
      signal: controller.signal, // Penambahan signal timeout aktif
    });
  } catch (error) {
    const reason =
      error.name === 'AbortError'
        ? 'Roadmap service timed out.'
        : 'Roadmap service is not reachable.';
    throw createAIServiceError(reason);
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createAIServiceError(body.detail || 'Roadmap generation failed.');
  }

  // Memasukkan hasil response mentah ke dalam helper normalisasi data
  return normalizeRoadmap(body);
}
