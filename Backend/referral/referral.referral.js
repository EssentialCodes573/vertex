const Referral = require('../models/referral.models');
const User = require('../models/users.models');
const getReferralBonus = require('../referral/referralBonus');

exports.signup = async (req, res) => {
    const { username, referredBy, ...otherFields } = req.body;
    const user = new User({ username, ...otherFields });
    await user.save();

    if (referredBy) {
        const referrer = await User.findOne({ username: referredBy });
        if (referrer) {
            await Referral.create({
                referrer: referrer._id,
                referred: user._id
            });

            // Count total referrals
            const referralCount = await Referral.countDocuments({ referrer: referrer._id });
            const bonus = getReferralBonus(referralCount);

            // Update referrer's bonus
            referrer.bonus = bonus;
            await referrer.save();
        }
    }

    res.status(201).json({ message: 'User registered successfully' });
};