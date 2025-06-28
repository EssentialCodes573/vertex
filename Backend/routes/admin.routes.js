const express = require("express");
const router = express.Router();
const User = require("../models/users.models");

// Example admin middleware (replace with your real admin check)
function adminOnly(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Admins only" });
}

// Add any amount to any user's balance
router.post("/add-balance", adminOnly, async (req, res) => {
  const { userId, amount } = req.body;
  console.log(req.body);
  console.log("Received request to add balance:", { userId, amount });
  console.log("Adding balance:", { userId, amount });
  if (!userId || !amount) {
    return res.status(400).json({ message: "userId and amount are required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.balance = (user.balance || 0) + Number(amount);
    console.log("Updated user balance:", user.balance);
    await user.save();
    console.log("Balance updated successfully for user:", userId);
    res.redirect("/admin");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
