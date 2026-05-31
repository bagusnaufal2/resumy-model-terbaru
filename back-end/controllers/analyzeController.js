import {
  analyzeResumeWithAI,
  generateRoadmapWithAI,
} from '../services/aiService.js';
import { extractResumeText } from '../services/fileParserService.js';

async function analyzeResume(req, res) {
  try {
    // Validasi file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX resume.',
      });
    }

    // Validasi Job Description
    const jobDescription = String(req.body.jobDescription || '').trim();

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please paste the target job description.',
      });
    }

    // Extract text dari CV
    const resumeText = await extractResumeText(req.file);

    // Analisis ATS
    const analysis = await analyzeResumeWithAI({
      resumeText,
      jobDescription,
    });

    console.log('======================');
    console.log('ANALYSIS RESULT');
    console.log(JSON.stringify(analysis, null, 2));
    console.log('======================');

    // Generate Roadmap (opsional)
    let roadmap = null;

    if (analysis.skillsMissing && analysis.skillsMissing.length > 0) {
      try {
        roadmap = await generateRoadmapWithAI({
          jobTitle: jobDescription,
          currentSkills: analysis.skillsHave.join(', '),
          missingSkills: analysis.skillsMissing.join(', '),
        });

        console.log('======================');
        console.log('ROADMAP RESULT');
        console.log(JSON.stringify(roadmap, null, 2));
        console.log('======================');
      } catch (error) {
        console.error('Roadmap generation failed:', error.message);

        // ATS tetap sukses walaupun roadmap gagal
        roadmap = null;
      }
    }

    // Response
    return res.json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: {
        ...analysis,
        roadmap,
      },
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'An error occurred while analyzing the resume.',
    });
  }
}

export default analyzeResume;
