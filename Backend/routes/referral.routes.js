const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controllers');
const auth = require('../middleware/auth');

router.post('/', auth, referralController.createReferral);
router.get('/', auth, referralController.getUserReferrals);

module.exports = router;