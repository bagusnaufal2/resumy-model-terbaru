import express from "express";
import analyzeResume from "../controllers/analyzeController.js";
import {
    getAnalysis,
    listAnalyses,
} from "../controllers/analysisHistoryController.js";
import requireHistoryKey from "../middlewares/historyAuthMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
const router = express.Router();

router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    });
});

router.post("/analyze", upload.single("resume"), analyzeResume);
router.get("/analyze", requireHistoryKey, listAnalyses);
router.get("/analyze/:id", requireHistoryKey, getAnalysis);

export default router;
