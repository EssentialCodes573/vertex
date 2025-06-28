const Deposit = require('../models/deposits.models');
const User = require('../models/users.models');
const Notification = require('../models/notification.model'); // <-- Add this

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

        // Create notification for incoming payment
        await Notification.create({
            type: 'payment',
            message: `Incoming payment of ₦${amount}`
        });

        res.status(201).json(deposit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};