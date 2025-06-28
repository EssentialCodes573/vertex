const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
    banks: [
        {
            bankName: String,
            accountNumber: String,
            accountName: String
        }
    ]
});

module.exports = mongoose.model("Bank", bankSchema);