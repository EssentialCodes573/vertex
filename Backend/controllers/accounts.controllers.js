const Account = require('../models/accounts.models');

exports.createAccount = async (req, res) => {
    try {
        const { accountNumber, bankName } = req.body;
        const userId = req.user._id;

        const account = new Account({
            user: userId,
            accountNumber,
            bankName
        });

        await account.save();
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserAccounts = async (req, res) => {
    try {
        const userId = req.user._id;
        const accounts = await Account.find({ user: userId });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};