import { generateRoadmapWithAI } from '../services/aiService.js';

async function generateRoadmap(req, res) {
  try {
    const targetRole = String(
      req.body.target_role || req.body.targetRole || '',
    ).trim();

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required.',
      });
    }

    const roadmap = await generateRoadmapWithAI({ targetRole });

    return res.json({
      success: true,
      message: 'Roadmap generated successfully.',
      data: roadmap,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'An error occurred while generating the roadmap.',
    });
  }
}

export default generateRoadmap;
