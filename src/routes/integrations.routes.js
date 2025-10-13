const router = require('express').Router();
const { body } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const { connectAccount, listAccounts } = require('../controllers/integrations.controller');

router.use(authRequired);

router.post('/connect', [
  body('platform').isIn(['instagram', 'tiktok', 'youtube']),
  body('accessToken').isString().notEmpty(),
], connectAccount);

router.get('/accounts', listAccounts);

module.exports = router;
