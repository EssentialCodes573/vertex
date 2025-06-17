const express = require('express');
const router = express.Router();
const depositsController = require('../controllers/deposits.controllers');
const auth = require('../middleware/auth');

router.post('/', auth, depositsController.createDeposit);
router.get('/', auth, depositsController.getUserDeposits);

module.exports = router;