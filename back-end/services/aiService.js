const DEFAULT_AI_SERVICE_URL = "http://127.0.0.1:8000";
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

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeAnalysis(data) {
  const numericScore = Number(data?.score);

  if (!Number.isFinite(numericScore)) {
    throw createAIServiceError("AI service returned an invalid score.");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(numericScore))),
    skillsHave: normalizeStringArray(data.skillsHave),
    skillsMissing: normalizeStringArray(data.skillsMissing),
    improvements: normalizeStringArray(data.improvements),
  };
}

function getAIServiceUrl() {
  return (process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL).replace(
    /\/$/,
    ""
  );
}

function getAIServiceTimeout() {
  const configuredTimeout = Number(process.env.AI_SERVICE_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;
}

export async function analyzeResumeWithAI({ resumeText, jobDescription }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getAIServiceTimeout());
  let response;

  try {
    response = await fetch(`${getAIServiceUrl()}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    const reason =
      error.name === "AbortError"
        ? "AI service timed out."
        : "AI service is not reachable. Start the Python AI service first.";
    throw createAIServiceError(reason);
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof body.detail === "string"
        ? body.detail
        : "AI service could not analyze this resume.";
    throw createAIServiceError(message);
  }

  return normalizeAnalysis(body);
}
