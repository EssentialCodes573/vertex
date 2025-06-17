const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referred: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reward: {
        type: Number,
        default: 0
    },
    rewardedAt: {
        type: Date,
        default: Date.now
    }
});

const Referral = mongoose.model('Referral', referralSchema);
module.exports = Referral;