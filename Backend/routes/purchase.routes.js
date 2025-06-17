const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controllers');
const auth = require('../middleware/auth'); // Adjust if you have authentication middleware

router.post('/', auth, purchaseController.createPurchase);
router.get('/', auth, purchaseController.getUserPurchases);

module.exports = router;