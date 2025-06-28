const Bank = require('../models/bank.model');

// Example controller function
exports.addBankAccount = async (req, res) => {
    try {
        const { userId, bankName, accountNumber, accountName } = req.body;
        let bankDoc = await Bank.findOne({ _id: userId });
        if (!bankDoc) {
            bankDoc = new Bank({ _id: userId, banks: [] });
        }
        bankDoc.banks.push({ bankName, accountNumber, accountName });
        await bankDoc.save();
        res.json({ message: 'Bank account added', banks: bankDoc.banks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};