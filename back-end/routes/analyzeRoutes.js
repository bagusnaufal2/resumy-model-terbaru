import express from "express";
import analyzeResume from "../controllers/analyzeController.js";
import {
    getAnalysisRecord,
    listAnalysisRecords,
} from "../controllers/analysisRecordController.js";
import requireAnalysisRecordKey from "../middlewares/analysisRecordAuthMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
const router = express.Router();

router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    });
});

router.post("/analyze", upload.single("resume"), analyzeResume);
router.get("/analyze", requireAnalysisRecordKey, listAnalysisRecords);
router.get("/analyze/:id", requireAnalysisRecordKey, getAnalysisRecord);

export default router;
