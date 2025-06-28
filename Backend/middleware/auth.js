const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.session && req.session.username) {
        // Optionally, attach user info to req.user
        req.user = {
            username: req.session.username,
            _id: req.session.userId,
            isAdmin: req.session.isAdmin
        };
        return next();
    }
    return res.status(401).json({ message: "Unauthorized: Please log in" });
};