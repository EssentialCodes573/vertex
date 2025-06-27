const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Load environment variables
dotenv.config();
console.log('JWT_SECRET from .env:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');

// Database and Models
const connectDB = require('./config/db');
const User = require('./models/users.models');
const Purchase = require('./models/purchase.models');
const upload = multer({ dest: 'public/uploads/' });

// Route imports
const purchaseRoutes = require('./routes/purchase.routes');
const accountsRoutes = require('./routes/accounts.routes');
const depositsRoutes = require('./routes/deposits.routes');
const referralRoutes = require('./routes/referral.routes');
const authRoutes = require('./routes/users.routes');
const Referral = require('./models/referral.models');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname));

// Session setup
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Static file serving
app.use('/main', express.static(path.join(__dirname, 'views', 'main')));
app.use('/land', express.static(path.join(__dirname, 'views', 'land')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Redirect root to login
app.get('/', (req, res) => {
    console.log('[GET /] Redirecting to /login');
    res.redirect('/login');
});

// Home page (EJS)
app.get('/home', async (req, res) => {
    console.log('[GET /home] Session username:', req.session.username);
    if (!req.session.username) {
        console.log('[GET /home] No session username, redirecting to /login');
        return res.redirect('/login');
    }
    const user = await User.findOne({ username: req.session.username });
    console.log('[GET /home] User found:', !!user);
    if (!user) {
        console.log('[GET /home] No user found, redirecting to /login');
        return res.redirect('/login');
    }

    // Fetch all purchases for this user, including product info
    const purchases = await Purchase.find({ user: user._id }).populate('product');
    console.log('[GET /home] Purchases found:', purchases.length);

    let credited = false;
    const now = new Date();

    for (const purchase of purchases) {
        const lastCreditedDate = purchase.lastCredited || purchase.purchasedAt;
        const daysPassed = Math.floor((now - lastCreditedDate) / (1000 * 60 * 60 * 24));
        if (daysPassed > 0) {
            const dailyReturn = purchase.product.dailyReturn * purchase.quantity;
            user.balance += dailyReturn * daysPassed;
            purchase.lastCredited = now;
            credited = true;
            await purchase.save();
            console.log(`[GET /home] Credited purchase ${purchase._id} with ${dailyReturn * daysPassed}`);
        }
    }

    if (credited) {
        await user.save();
        console.log('[GET /home] User balance updated and saved.');
    }
    const balance = user ? user.balance : 0;
    console.log('[GET /home] Rendering dashboard with balance:', balance);
    console.log('User sent to EJS:', user);
    res.render('main/vertex', { user, balance, transactions: purchases });
    console.log('[GET /home] Home page rendered successfully');
});

// Login/signup page (EJS)
app.get('/login', (req, res) => {
if (req.session.username && req.session.isAdmin) {
    return res.redirect('/admin')
}

    console.log('[GET /login] Session username:', req.session.username);
    if (req.session.username) {
        console.log('[GET /login] Already logged in, redirecting to /home');
        return res.redirect('/home');
    }
    res.render('land/index', { user: null }, (err, html) => {
        if (err) {
            console.error('[GET /login] Error rendering index.ejs:', err);
            return res.status(err.status || 500).end();
        }
        res.send(html);
        console.log('[GET /login] Login page rendered successfully');
    });
});

// Login POST
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('[POST /api/auth/login] Received:', { username, password });

    // Check for special admin credentials
    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        req.session.username = username;
        req.session.isAdmin = true;
        console.log('[POST /api/auth/login] Admin credentials matched. Redirecting to /admin');
        return res.json({ message: 'Admin login', redirect: '/admin' });
    }

    // Normal user login
    const user = await User.findOne({ username });
    console.log('[POST /api/auth/login] User found:', !!user);

    if (user && (await user.comparePassword(password))) {
        req.session.username = username;
        req.session.isAdmin = user.isAdmin || false;
        req.session.save(err => {
            if (err) {
                console.error('[POST /api/auth/login] Session save error:', err);
                return res.status(500).send('Session error');
            }
            console.log('[POST /api/auth/login] Session SET:', {
                username: req.session.username,
                isAdmin: req.session.isAdmin
            });
            return res.json({ message: 'Login successful!', redirect: '/home' });
        });
    } else {
        console.log('[POST /api/auth/login] Invalid credentials');
    }
});

// user profile
app.get('/profile', async (req, res) => {
    if (!req.session.username) return res.redirect('/login');
    const user = await User.findOne({ username: req.session.username });
    if (!user) return res.redirect('/login');

    // Fetch transactions, purchases, and referrals
    const purchases = await Purchase.find({ user: user._id }).populate('product');
    // Assuming you have a Referral model
    const referrals = await Referral.find({ referrer: user._id });

    res.render('main/profile', {
        user,
        purchases,
        referrals
    });
});

// profile image upload
app.post('/profile/upload', upload.single('profileImage'), async (req, res) => {
    if (!req.session.username) return res.redirect('/login');
    const user = await User.findOne({ username: req.session.username });
    if (!user) return res.redirect('/login');

    if (req.file) {
        user.profileImage = '/uploads/' + req.file.filename;
        await user.save();
    }
    res.redirect('/profile');
});

// // Admin-only middleware
// function adminOnly(req, res, next) {
//     if (!req.session.username) return res.redirect('/login');
//     User.findOne({ username: req.session.username }, (err, user) => {
//         if (err || !user || !user.isAdmin) {
//             return res.status(403).send('Access denied');
//         }
//         next();
//     });
// }
// app.get('/admin', adminOnly, async (req, res) => {
//     // Fetch any admin data you want to show
//     res.render('admin/dashboard', { user: req.session.username });
// });
// {
//   "username": "adminuser",
//   "isAdmin": true
// }

// Deposit request API
app.post('/api/deposit-request', async (req, res) => {
    const { accountName, bankName } = req.body;
    console.log('[POST /api/deposit-request] Payload:', req.body);
    try {
        const payload = { accountName, bankName };
        const response = await axios.post(
            'https://wema-alatdev-apimgt.azure-api.net/alat-pay/api/EcommerceTransfer/transfer-fund-request',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 1b085fd1a532429db580e08979e4d183',
                    'Ocp-Apim-Subscription-Key': '14e2b202eec34bc596b278ae5df5a9d4'
                }
            }
        );
        console.log('[POST /api/deposit-request] Wema API response:', response.data);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('[POST /api/deposit-request] Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Bank API request failed' });
    }
});

// Wema webhook
app.post('/wema/webhook', async (req, res) => {
    const payload = req.body;
    console.log('[POST /wema/webhook] Incoming payload:', JSON.stringify(payload, null, 2));
    if (payload.transactionType === 'CREDIT') {
        console.log(`[POST /wema/webhook] Received credit of ₦${payload.amount} from ${payload.senderName}`);
    }
    res.status(200).send('Webhook received');
});

// API routes
app.use('/api/purchases', purchaseRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/deposits', depositsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server Started at http://localhost:${PORT}`);
});