const express = require("express");
const router = express.Router();
const User = require("../models/users.models");

// Add bank account
router.post("/add", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const { bankName, accountNumber, accountName } = req.body;
  if (!bankName || !accountNumber || !accountName) {
    return res.status(400).json({ message: "All fields required" });
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error("User not found for ID:", req.session.userId);
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.banks) user.banks = [];
    user.banks.push({ bankName, accountNumber, accountName });
    await user.save();
    res.json({ banks: user.banks });
  } catch (err) {
    console.error("Error in /api/bank/add:", err);
    res.status(500).json({ message: "Error adding bank account" });
  }
});

// Remove bank account
router.post("/remove", async (req, res) => {
  const { accountNumber } = req.body;
  try {
    const user = await User.findById(req.session.userId);
    user.banks = user.banks.filter((b) => b.accountNumber !== accountNumber);
    await user.save();
    res.json({ banks: user.banks });
  } catch (err) {
    res.status(500).json({ message: "Error removing bank account" });
  }
});

module.exports = router;
