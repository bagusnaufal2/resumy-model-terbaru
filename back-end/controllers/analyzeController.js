import { extractResumeText } from '../services/fileParserService.js';
// Catatan: analyzeResumeWithAI yang lama sengaja tidak kita pakai karena AI sudah pindah ke Python

global.resumeDatabaseDummy = global.resumeDatabaseDummy || [];

async function analyzeResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX resume.',
      });
    }

    const jobDescription = String(req.body.jobDescription || '').trim();

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please paste the target job description.',
      });
    }

    // 1. Ekstrak file menjadi teks murni di sisi Express
    const resumeText = await extractResumeText(req.file);

    const pythonServiceUrl =
      process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

    const responseAI = await fetch(`${pythonServiceUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
    });

    if (!responseAI.ok) {
      throw new Error(`AI Python Service error! Status: ${responseAI.status}`);
    }

    // Ini adalah HASIL ANALISIS NYATA dari model Keras/TensorFlow di Python
    const analysis = await responseAI.json();

    //  Menyimpan Plaintext CV & Hasil Analisis Python ke RAM

    const dataYangDisimpan = {
      id: global.resumeDatabaseDummy.length + 1,
      fileName: req.file.originalname,
      jobDescription: jobDescription,
      resumeContent: resumeText,
      aiAnalysis: analysis,
      savedAt: new Date(),
    };

    global.resumeDatabaseDummy.push(dataYangDisimpan);

    console.log('=== KONEKSI PYTHON SUKSES & DATA MASUK RAM ===');
    console.log('Total Data Terkumpul:', global.resumeDatabaseDummy.length);
    console.log('==============================================');
    // =================================================================

    return res.json({
      success: true,
      message: 'Resume analyzed and saved successfully.',
      totalSavedData: global.resumeDatabaseDummy.length,
      data: analysis,
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Detail Error di Express:', error);

    return res.status(500).json({
      success: false,
      message:
        'An error occurred while connecting to AI Service or saving data.',
    });
  }
}

export default analyzeResume;
