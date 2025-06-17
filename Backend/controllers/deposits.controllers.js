const Deposit = require('../models/deposits.models');
const User = require('../models/users.models');

exports.createDeposit = async (req, res) => {
    try {
        const { amount, transferImage } = req.body;
        const userId = req.user._id;

        const deposit = new Deposit({
            user: userId,
            amount,
            transferImage
        });

        await deposit.save();
        res.status(201).json(deposit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserDeposits = async (req, res) => {
    try {
        const userId = req.user._id;
        const deposits = await Deposit.find({ user: userId });
        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deposit = async (req, res) => {
    const amount = req.body;
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        user.balance += amount;
        await user.save();
        res.status(200).json({ message: 'Deposit successful', balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}