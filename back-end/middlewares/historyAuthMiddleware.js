function getConfiguredHistoryKey() {
  return String(process.env.ANALYSIS_HISTORY_KEY || '').trim();
}

export default function requireHistoryKey(req, res, next) {
  const configuredKey = getConfiguredHistoryKey();
  const providedKey = String(req.get('x-admin-key') || '').trim();

  if (!configuredKey) {
    return res.status(403).json({
      success: false,
      message: 'Analysis history access is disabled.',
    });
  }

  if (providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid analysis history key.',
    });
  }

  return next();
}
