const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    },
    lastCredited: {
        type: Date,
        default: Date.now
    }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;