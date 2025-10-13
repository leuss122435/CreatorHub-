const IntegrationAccount = require('../models/IntegrationAccount');
const { validationResult } = require('express-validator');

exports.connectAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { platform, accessToken } = req.body;
  try {
    const account = await IntegrationAccount.create({ user: req.user.id, platform, accessToken });
    res.status(201).json(account);
  } catch (e) {
    res.status(500).json({ error: 'Failed to connect account' });
  }
};

exports.listAccounts = async (req, res) => {
  try {
    const accounts = await IntegrationAccount.find({ user: req.user.id });
    res.json(accounts);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list accounts' });
  }
};
