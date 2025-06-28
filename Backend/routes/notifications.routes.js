const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 }).limit(50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

module.exports = router;