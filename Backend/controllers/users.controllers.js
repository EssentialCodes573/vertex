const User = require('../models/users.models');
const Notification = require('../models/notification.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    try {
        const { firstname, lastname, username, email, mobilenumber, password } = req.body;
        const user = new User({ firstname, lastname, username, email, mobilenumber, password });
        await user.save();

         // Create notification for new user registration
    await Notification.create({
      type: 'user',
      message: `New user registered: ${user.username}`
    });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


        res.json({ message: 'Login successful!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};