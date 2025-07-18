const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true, unique: true },
    lastname: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, index: true },
    banks: [
    {
      bankName: String,
      accountNumber: String,
      accountName: String
    }
  ],
    email: { type: String, required: true, unique: true, index: true},
    mobilenumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0, index: true },
    bonus: { type: Number, default: 0 },
    profileImage: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    referredBy: { type: String, default: null, index: true },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;