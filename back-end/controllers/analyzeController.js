import { analyzeResumeWithAI } from "../services/aiService.js";
import { extractResumeText } from "../services/fileParserService.js";

async function analyzeResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX resume.",
      });
    }

    const jobDescription = String(req.body.jobDescription || "").trim();

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Please paste the target job description.",
      });
    }

    const resumeText = await extractResumeText(req.file);
    const analysis = await analyzeResumeWithAI({
      resumeText,
      jobDescription,
    });

    return res.json({
      success: true,
      message: "Resume analyzed successfully.",
      data: analysis,
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
      message:
        error.statusCode
          ? error.message
          : "An error occurred while analyzing the resume.",
    });
  }
}

export default analyzeResume;
