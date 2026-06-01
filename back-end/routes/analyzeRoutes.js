import express from 'express';
import analyzeResume from '../controllers/analyzeController.js';
import upload from '../middlewares/uploadMiddleware.js';

// TAMBAHAN: Kita butuh trik ini untuk mengintip variabel dummy di dalam file controller
import { exec } from 'child_process';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

router.post('/analyze', upload.single('resume'), analyzeResume);

// =================================================================
// MODIFIKASI: Mengembalikan data array memori langsung ke Postman/Browser
// =================================================================
router.get('/history', async (req, res) => {
  try {
    // Kita panggil request dummy history langsung dari memori backend
    // Untuk RESTful API yang bersih, data dikembalikan dalam bentuk JSON array
    return res.json({
      success: true,
      message: 'Berhasil mengambil data riwayat dari RAM Server.',
      totalData: global.resumeDatabaseDummy
        ? global.resumeDatabaseDummy.length
        : 0,
      database: global.resumeDatabaseDummy || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// =================================================================

export default router;
