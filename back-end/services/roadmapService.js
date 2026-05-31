import axios from 'axios';

/**
 * Mengambil data roadmap dari FastAPI Python (ai-service)
 * @param {Object} params
 * @param {string} params.jobTitle
 * @param {string} params.currentSkills
 * @param {string} params.missingSkills
 */
export const generateRoadmapFromAI = async ({
  jobTitle,
  currentSkills,
  missingSkills,
}) => {
  try {
    const AI_SERVICE_URL =
      process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/generate-roadmap`,
      {
        job_title: jobTitle,
        current_skills: currentSkills,
        missing_skills: missingSkills,
      },
    );

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error('Respons sukses tidak ditemukan dari layanan AI Python');
  } catch (error) {
    console.error('Error di dalam roadmapService.js:', error.message);
    throw error;
  }
};
