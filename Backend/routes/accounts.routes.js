const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accounts.controllers');
const auth = require('../middleware/auth');

router.post('/', auth, accountsController.createAccount);
router.get('/', auth, accountsController.getUserAccounts);

module.exports = router;