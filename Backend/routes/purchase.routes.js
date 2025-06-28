const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controllers');
const auth = require('../middleware/auth');

console.log("Loading purchase routes...");

router.post('/', auth, purchaseController.createPurchase);

router.get('/', auth, (req, res, next) => {
  console.log("GET /api/purchase called");
  if (typeof purchaseController.getUserPurchases !== "function") {
    console.error("getUserPurchases is not a function!");
    return res.status(500).json({ message: "Internal server error" });
  }
  purchaseController.getUserPurchases(req, res, next);
});

module.exports = router;