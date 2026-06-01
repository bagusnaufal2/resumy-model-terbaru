function getConfiguredRecordKey() {
  return String(
    process.env.ANALYSIS_RECORD_KEY ||
      process.env.ANALYSIS_HISTORY_KEY ||
      '',
  ).trim();
}

export default function requireAnalysisRecordKey(req, res, next) {
  const configuredKey = getConfiguredRecordKey();
  const providedKey = String(req.get('x-admin-key') || '').trim();

  if (!configuredKey) {
    return res.status(403).json({
      success: false,
      message: 'Analysis record access is disabled.',
    });
  }

  if (providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid analysis record key.',
    });
  }

  return next();
}
