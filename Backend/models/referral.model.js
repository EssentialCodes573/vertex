const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reward: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);