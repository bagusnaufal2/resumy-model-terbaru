import {
  getAnalysisHistory,
  getAnalysisRecordById,
} from '../services/analysisHistoryService.js';

export async function listAnalyses(req, res) {
  try {
    const history = await getAnalysisHistory();

    return res.json({
      success: true,
      message: 'Analysis history retrieved successfully.',
      data: history,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Could not retrieve analysis history.',
    });
  }
}

export async function getAnalysis(req, res) {
  try {
    const analysis = await getAnalysisRecordById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Analysis record retrieved successfully.',
      data: analysis,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Could not retrieve analysis record.',
    });
  }
}
