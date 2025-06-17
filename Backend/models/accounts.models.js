const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    bankName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;