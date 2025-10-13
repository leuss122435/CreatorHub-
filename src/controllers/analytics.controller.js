const { validationResult } = require('express-validator');
const SocialMetric = require('../models/SocialMetric');

exports.recordMetrics = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const doc = await SocialMetric.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Failed to record metrics' });
  }
};

exports.listMetrics = async (req, res) => {
  const { projectId } = req.params;
  const { platform, from, to } = req.query;
  try {
    const query = { project: projectId };
    if (platform) query.platform = platform;
    if (from || to) {
      query.capturedAt = {};
      if (from) query.capturedAt.$gte = new Date(from);
      if (to) query.capturedAt.$lte = new Date(to);
    }
    const items = await SocialMetric.find(query).sort({ capturedAt: 1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list metrics' });
  }
};
