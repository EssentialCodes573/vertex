const Referral = require('../models/referral.model');

exports.createReferral = async (req, res) => {
    try {
        const { referredId, reward } = req.body;
        const referrerId = req.user._id;

        const referral = new Referral({
            referrer: referrerId,
            referred: referredId,
            reward: reward || 0
        });

        await referral.save();
        res.status(201).json(referral);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserReferrals = async (req, res) => {
    try {
        const referrerId = req.user._id;
        const referrals = await Referral.find({ referrer: referrerId }).populate('referred');
        res.json(referrals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};