const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3000;
const path = require('path');
const User = require('./models/users.models');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Route imports
const purchaseRoutes = require('./routes/purchase.routes');
const accountsRoutes = require('./routes/accounts.routes');
const depositsRoutes = require('./routes/deposits.routes');
const referralRoutes = require('./routes/referral.routes');
const authRoutes = require('./routes/users.routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(session({
    secret: '11259375',
    resave: false,
    saveUninitialized: true
}));

// Serve static files for /main
app.use('/main', express.static(path.join(__dirname, 'views', 'main')));

// Home page (EJS)
app.get('/home', async (req, res) => {
    const user = await User.findOne({ username: req.session.username });
    const balance = user ? user.balance : 0;
    res.render('main/vertex', { user, balance });
    console.log('Home page rendered successfully');
});

// Login/signup page (HTML)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '/land/index.js'), function (err) {
        if (err) {
            console.error('Error sending lg.html:', err);
            res.status(err.status || 500).end();
        } else {
            console.log('Login page rendered successfully');
        }
    });
});

// API routes
app.use('/api/purchases', purchaseRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/deposits', depositsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server Started at http://localhost:${PORT}`);
});