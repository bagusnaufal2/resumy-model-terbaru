import {
  getAnalysisRecordById,
  getAnalysisRecords,
} from '../services/analysisRecordService.js';

export async function listAnalysisRecords(req, res) {
  try {
    const records = await getAnalysisRecords();

    return res.json({
      success: true,
      message: 'Analysis records retrieved successfully.',
      data: records,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Could not retrieve analysis records.',
    });
  }
}

export async function getAnalysisRecord(req, res) {
  try {
    const analysisRecord = await getAnalysisRecordById(req.params.id);

    if (!analysisRecord) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Analysis record retrieved successfully.',
      data: analysisRecord,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Could not retrieve analysis record.',
    });
  }
}
