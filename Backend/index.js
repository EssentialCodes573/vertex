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
const Purchase = require('./models/purchase.models');

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
app.use(express.static(__dirname));
app.use('/main', express.static(path.join(__dirname, 'views', 'main')));
app.use('/land', express.static(path.join(__dirname, 'views', 'land')));

// Home page (EJS)
app.get('/home', async (req, res) => {
    const user = await User.findOne({ username: req.session.username });
    if (!user) return res.redirect('/');

    // Fetch all purchases for this user, including product info
    const purchases = await Purchase.find({ user: user._id }).populate('product');
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
        }
    }

    if (credited) await user.save();
    const balance = user ? user.balance : 0;
    res.render('main/vertex', { user, balance, transactions: purchases });
    console.log('Home page rendered successfully');
});

// Login/signup page (HTML)
app.get('/', (req, res) => {
    res.render('land/index', {}, function (err, html) {
        if (err) {
            console.error('Error rendering index.ejs:', err);
            res.status(err.status || 500).end();
        } else {
            res.send(html);
            console.log('Login page rendered successfully');
        }
    });
});

app.post('/api/deposit-request', async (req, res) => {
    const { accountName, bankName } = req.body;

    try {
        // Prepare your payload as required by the Wema API
        const payload = {
            // Fill this with the required fields for the API
            accountName,
            bankName,
            // ...other required fields
        };

        const response = await axios.post(
            'https://wema-alatdev-apimgt.azure-api.net/alat-pay/api/EcommerceTransfer/transfer-fund-request',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // Add your API key or authorization here if required
                    'Authorization': 'Bearer 1b085fd1a532429db580e08979e4d183',
                    'Ocp-Apim-Subscription-Key': '14e2b202eec34bc596b278ae5df5a9d4'
                }
            }
        );

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Bank API request failed' });
    }
});




app.post('/wema/webhook', async (req, res) => {
  const payload = req.body;

  console.log('📨 Incoming Wema Webhook:', JSON.stringify(payload, null, 2));

  // Example handling logic:
  if (payload.transactionType === 'CREDIT') {
    // You could verify the account, update user's balance, etc.
    console.log(`💰 Received credit of ₦${payload.amount} from ${payload.senderName}`);
  }

  res.status(200).send('Webhook received');
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