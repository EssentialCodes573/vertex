const express = require('express');
const router = express.Router();
const authController = require('../controllers/users.controllers');
const User = require('../models/users.models');
const Referral = require('../models/referral.model');

// router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/signup', async (req, res) => {
    const { firstname, lastname, username, email, mobilenumber, password, referredBy } = req.body;
    try {
        let referrer = null;
        if (referredBy) {
            // Find the user with the given username
            referrer = await User.findOne({ username: referredBy });
        }

        // Create the new user
        const user = new User({
            firstname,
            lastname,
            username,
            email,
            mobilenumber,
            password,
            referredBy: referrer ? referrer._id : null
        });
        await user.save();

        // Create a referral record if referrer exists
        if (referrer) {
            const referral = new Referral({
                referrer: referrer._id,
                referred: user._id,
                reward: 0
            });
            await referral.save();
        }

        res.status(201).json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;