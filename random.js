// const express = require('express');
// const session = require('express-session');
// const cors = require('cors');
// const axios = require('axios');
// const app = express();
// const PORT = 3000;
// const path = require('path');
// const User = require('./models/users.models');
// const connectDB = require('./config/db');
// const dotenv = require('dotenv');

// dotenv.config(); // Make sure environment variables are loaded
// console.log('JWT_SECRET from .env:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');

// // Route imports
// const purchaseRoutes = require('./routes/purchase.routes');
// const accountsRoutes = require('./routes/accounts.routes');
// const depositsRoutes = require('./routes/deposits.routes');
// const referralRoutes = require('./routes/referral.routes');
// const authRoutes = require('./routes/users.routes');
// const Purchase = require('./models/purchase.models');

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Set EJS as view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(__dirname));

// app.use(session({
//     secret: '11259375',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }
// }));

// // Serve static files
// app.use('/main', express.static(path.join(__dirname, 'views', 'main')));
// app.use('/land', express.static(path.join(__dirname, 'views', 'land')));

// // Redirect root to login
// // app.get('/', (req, res) => {
// //     res.redirect('/login');
// // });

// // Home page (EJS)
// // app.get('/home', async (req, res) => {
// //     if (!req.session.username) return res.redirect('/login');
// //     const user = await User.findOne({ username: req.session.username });
// //     if (!user) return res.redirect('/login');

// //     // Fetch all purchases for this user, including product info
// //     const purchases = await Purchase.find({ user: user._id }).populate('product');
// //     let credited = false;
// //     const now = new Date();

// //     for (const purchase of purchases) {
// //         const lastCreditedDate = purchase.lastCredited || purchase.purchasedAt;
// //         const daysPassed = Math.floor((now - lastCreditedDate) / (1000 * 60 * 60 * 24));
// //         if (daysPassed > 0) {
// //             const dailyReturn = purchase.product.dailyReturn * purchase.quantity;
// //             user.balance += dailyReturn * daysPassed;
// //             purchase.lastCredited = now;
// //             credited = true;
// //             await purchase.save();
// //         }
// //     }

// //     if (credited) await user.save();
// //     const balance = user ? user.balance : 0;
// //     res.render('main/vertex', { user, balance, transactions: purchases });
// //     console.log('Home page rendered successfully');
// // });

// // Login/signup page (EJS)
// // app.get('/login', (req, res) => {
// //     if (req.session.username) {
// //         // User is already logged in, redirect to home page
// //         return res.redirect('/home');
// //     }
// //     // Not logged in, show login/signup page
// //     res.render('land/index', { user: null }, function (err, html) {
// //         if (err) {
// //             console.error('Error rendering index.ejs:', err);
// //             res.status(err.status || 500).end();
// //         } else {
// //             res.send(html);
// //             console.log('Login page rendered successfully');
// //         }
// //     });
// // });

// // Example login POST (add your real logic)
// // app.post('/login', async (req, res) => {
// //     const { username, password } = req.body; // Make sure your form sends a 'password' field
// //     const user = await User.findOne({ username });
// //     console.log('--- POST /login attempt ---');
// //     console.log('Received username:', username);

// //     if (user && (await user.matchPassword(password))) { // Use the matchPassword method
// //         req.session.username = username;
// //         req.session.save(err => {
// //             if (err) return res.status(500).send('Session error');
// //             return res.redirect('/home');
// //         });
// //         console.log('Session SET: req.session.username =', req.session.username);
// //         return res.redirect('/home');
// //     } else {
// //         // Handle incorrect username or password
// //         res.redirect('/login?error=invalid_credentials');
// //     }
// // });

// // app.post('/login', async (req, res) => {
// //     const { username } = req.body; // Assuming you're still just using username for login for now
// //     console.log('--- POST /login attempt ---');
// //     console.log('Received username:', username);

// //     const user = await User.findOne({ username });
// //     if (user) {
// //         console.log('User found in DB:', user.username);
// //         req.session.username = username;
// //         console.log('Session SET: req.session.username =', req.session.username);

// //         // Crucial: Make sure the session is saved before redirecting
// //         req.session.save(err => {
// //             if (err) {
// //                 console.error('Error saving session:', err);
// //                 return res.status(500).send('Login failed due to session error.');
// //             }
// //             console.log('Session successfully saved. Redirecting to /home.');
// //             return res.redirect('/home');
// //         });

// //     } else {
// //         console.log('User NOT found in DB for username:', username);
// //         res.redirect('/login?error=invalid'); // Add a query param for better client-side feedback
// //     }
// // });


// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////
// //// GET /login -show login page
// app.get('/login', (req, res) => {
//     res.render('land/index', { user: null, error: null });
// })
// ////POST /login - handle login
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });

//     if (!user || user.password !== password) {
//         return res.render('land/index', { user: null, error: 'Invalid credentials' });
//     }

//     req.session.userId = user._id;
//     req.session.save(err => {
//         if (err) {
//             console.error('Session NOT saved:', err);
//             return res.status(500).send('Session error');
//         }
//         console.log('Session successfully saved. userId:', req.session.userId);
//         res.redirect('/home');
//     });
// });
// // GET /home - Show home page if logged in
// app.get('/home', async (req, res) => {
//     // if (!req.session.userId) {
//     //     return res.redirect('/login');
//     // }
//     const user = await User.findById(req.session.userId);
//     const balance = user && user.balance ? user.balance : 0;
//     res.render('main/vertex', { user, balance });
// });
// // GET / - Redirect to login
// app.get('/', (req, res) => {
//     res.redirect('/login');
// });
// // admin route and fetching users from database
// app.get('/admin', async (req, res) => {
//     try {
//         const users = await User.find(); // Fetch all users
//         res.render('admin/dashboard', { users });
//     } catch (err) {
//         res.status(500).send('Error fetching users');
//     }
// });
// ////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////

// // app.post('/api/deposit-request', async (req, res) => {
// //     const { accountName, bankName } = req.body;

// //     try {
// //         // Prepare your payload as required by the Wema API
// //         const payload = {
// //             accountName,
// //             bankName,
// //             // ...other required fields
// //         };

// //         const response = await axios.post(
// //             'https://wema-alatdev-apimgt.azure-api.net/alat-pay/api/EcommerceTransfer/transfer-fund-request',
// //             payload,
// //             {
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'Authorization': 'Bearer 1b085fd1a532429db580e08979e4d183',
// //                     'Ocp-Apim-Subscription-Key': '14e2b202eec34bc596b278ae5df5a9d4'
// //                 }
// //             }
// //         );

// //         res.json({ success: true, data: response.data });
// //     } catch (error) {
// //         console.error(error.response?.data || error.message);
// //         res.status(500).json({ success: false, message: 'Bank API request failed' });
// //     }
// // });

// // app.post('/wema/webhook', async (req, res) => {
// //     const payload = req.body;

// //     console.log('📨 Incoming Wema Webhook:', JSON.stringify(payload, null, 2));

// //     // Example handling logic:
// //     if (payload.transactionType === 'CREDIT') {
// //         // You could verify the account, update user's balance, etc.
// //         console.log(`💰 Received credit of ₦${payload.amount} from ${payload.senderName}`);
// //     }

// //     res.status(200).send('Webhook received');
// // });

// // API routes
// app.use('/api/purchases', purchaseRoutes);
// app.use('/api/accounts', accountsRoutes);
// app.use('/api/deposits', depositsRoutes);
// app.use('/api/referrals', referralRoutes);
// app.use('/api/auth', authRoutes);

// // 404 handler for unknown routes
// // app.use((req, res) => {
// //     res.status(404).send('404 Not Found');
// // });

// app.listen(PORT, () => {
//     connectDB();
//     console.log(`Server Started at http://localhost:${PORT}`);
// });



// // const express = require('express');
// // const session = require('express-session');
// // const path = require('path');

// // const app = express();
// // const PORT = 3000;

// // app.set('view engine', 'ejs');
// // app.set('views', path.join(__dirname, 'views'));

// // app.use(session({
// //     secret: 'your-secret-key',
// //     resave: false,
// //     saveUninitialized: false
// // }));

// // app.use(express.urlencoded({ extended: true }));

// // app.get('/home', (req, res) => {
// //     // Allow access without login
// //     const user = req.session.user || null;
// //     const balance = user && user.balance ? user.balance : 0;
// //     res.render('main/vertex', { user, balance });
// // });

// // app.listen(PORT, () => {
// //     console.log(`Server started at http://localhost:${PORT}`);
// // });








// // const express = require('express');
// // const session = require('express-session');
// // const cors = require('cors');
// // const axios = require('axios');
// // const path = require('path');
// // const dotenv = require('dotenv');
// // const app = express();
// // const PORT = 3000;

// // // Load environment variables
// // dotenv.config();
// // console.log('JWT_SECRET from .env:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');

// // // Database and Models
// // const connectDB = require('./config/db');
// // const User = require('./models/users.models');
// // const Purchase = require('./models/purchase.models');

// // // Route imports
// // const purchaseRoutes = require('./routes/purchase.routes');
// // const accountsRoutes = require('./routes/accounts.routes');
// // const depositsRoutes = require('./routes/deposits.routes');
// // const referralRoutes = require('./routes/referral.routes');
// // const authRoutes = require('./routes/users.routes');

// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // View engine setup
// // app.set('view engine', 'ejs');
// // app.set('views', path.join(__dirname, 'views'));
// // app.use(express.static(__dirname));

// // // Session setup
// // app.use(session({
// //     secret: process.env.JWT_SECRET,
// //     resave: false,
// //     saveUninitialized: false,
// //     cookie: { secure: false }
// // }));

// // // Static file serving
// // app.use('/main', express.static(path.join(__dirname, 'views', 'main')));
// // app.use('/land', express.static(path.join(__dirname, 'views', 'land')));

// // // Redirect root to login
// // app.get('/', (req, res) => res.redirect('/login'));

// // // Home page (EJS)
// // app.get('/home', async (req, res) => {
// //     if (!req.session.username) return res.redirect('/login');
// //     const user = await User.findOne({ username: req.session.username });
// //     if (!user) return res.redirect('/login');

// //     // Fetch all purchases for this user, including product info
// //     const purchases = await Purchase.find({ user: user._id }).populate('product');
// //     let credited = false;
// //     const now = new Date();

// //     for (const purchase of purchases) {
// //         const lastCreditedDate = purchase.lastCredited || purchase.purchasedAt;
// //         const daysPassed = Math.floor((now - lastCreditedDate) / (1000 * 60 * 60 * 24));
// //         if (daysPassed > 0) {
// //             const dailyReturn = purchase.product.dailyReturn * purchase.quantity;
// //             user.balance += dailyReturn * daysPassed;
// //             purchase.lastCredited = now;
// //             credited = true;
// //             await purchase.save();
// //         }
// //     }

// //     if (credited) await user.save();
// //     const balance = user ? user.balance : 0;
// //     res.render('main/vertex', { user, balance, transactions: purchases });
// //     console.log('Home page rendered successfully');
// // });

// // // Login/signup page (EJS)
// // app.get('/login', (req, res) => {
// //     if (req.session.username) return res.redirect('/home');
// //     res.render('land/index', { user: null }, (err, html) => {
// //         if (err) {
// //             console.error('Error rendering index.ejs:', err);
// //             return res.status(err.status || 500).end();
// //         }
// //         res.send(html);
// //         console.log('Login page rendered successfully');
// //     });
// // });

// // // Login POST
// // app.post('/login', async (req, res) => {
// //     const { username, password } = req.body;
// //     const user = await User.findOne({ username });
// //     console.log('--- POST /login attempt ---');
// //     console.log('Received username:', username);

// //     if (user && (await user.matchPassword(password))) {
// //         req.session.username = username;
// //         req.session.save(err => {
// //             if (err) return res.status(500).send('Session error');
// //             console.log('Session SET: req.session.username =', req.session.username);
// //             return res.redirect('/home');
// //         });
// //     } else {
// //         res.redirect('/login?error=invalid_credentials');
// //     }
// // });

// // // Deposit request API
// // app.post('/api/deposit-request', async (req, res) => {
// //     const { accountName, bankName } = req.body;
// //     try {
// //         const payload = { accountName, bankName };
// //         const response = await axios.post(
// //             'https://wema-alatdev-apimgt.azure-api.net/alat-pay/api/EcommerceTransfer/transfer-fund-request',
// //             payload,
// //             {
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'Authorization': 'Bearer 1b085fd1a532429db580e08979e4d183',
// //                     'Ocp-Apim-Subscription-Key': '14e2b202eec34bc596b278ae5df5a9d4'
// //                 }
// //             }
// //         );
// //         res.json({ success: true, data: response.data });
// //     } catch (error) {
// //         console.error(error.response?.data || error.message);
// //         res.status(500).json({ success: false, message: 'Bank API request failed' });
// //     }
// // });

// // // Wema webhook
// // app.post('/wema/webhook', async (req, res) => {
// //     const payload = req.body;
// //     console.log('📨 Incoming Wema Webhook:', JSON.stringify(payload, null, 2));
// //     if (payload.transactionType === 'CREDIT') {
// //         console.log(`💰 Received credit of ₦${payload.amount} from ${payload.senderName}`);
// //     }
// //     res.status(200).send('Webhook received');
// // });

// // // API routes
// // app.use('/api/purchases', purchaseRoutes);
// // app.use('/api/accounts', accountsRoutes);
// // app.use('/api/deposits', depositsRoutes);
// // app.use('/api/referrals', referralRoutes);
// // app.use('/api/auth', authRoutes);




// // // Start server
// // app.listen(PORT, () => {
// //     connectDB();
// //     console.log(`Server Started at http://localhost:${PORT}`);
// // });






// <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>Profile | Vertex</title>
//     <script src="https://cdn.tailwindcss.com"></script>
//     <link
//       rel="stylesheet"
//       href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
//     />
//     <link rel="stylesheet" href="/main/style.css" />
//   </head>
//   <body class="min-h-screen bg-[#18181b] text-white flex flex-col">
//     <header class="p-4 flex items-center justify-between bg-[#23232a] shadow">
//       <div class="flex items-center space-x-2">
//         <div
//           class="w-8 h-8 bg-accent rounded-full flex items-center justify-center"
//         >
//           <i class="fas fa-wave-square text-primary text-xl"></i>
//         </div>
//         <span class="text-lg font-semibold text-accent">Vertex</span>
//       </div>
//       <a href="/home" class="text-accent hover:underline flex items-center">
//         <i class="fas fa-arrow-left mr-2"></i> Back to Dashboard
//       </a>
//     </header>

//     <main class="flex-grow max-w-3xl mx-auto p-6">
//       <div
//         class="bg-[#23232a] rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-start"
//       >
//         <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
//           <div
//             class="flex-shrink-0 mb-4 md:mb-0 md:mr-8 flex flex-col items-center"
//           >
//             <div
//               class="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-4xl text-purple-200 shadow-lg border-4 border-purple-900 overflow-hidden"
//             >
//               <% if (user.profileImage) { %>
//               <img
//                 src="<%= user.profileImage %>"
//                 alt="Profile"
//                 class="object-cover w-full h-full"
//               />
//               <% } else { %>
//               <i class="fas fa-user"></i>
//               <% } %>
//             </div>
//             <form
//               action="/profile/upload"
//               method="POST"
//               enctype="multipart/form-data"
//               class="mt-3 flex flex-col items-center"
//             >
//               <label
//                 class="block text-purple-300 text-sm mb-1 cursor-pointer hover:underline"
//               >
//                 <i class="fas fa-camera mr-1"></i> Change Photo
//                 <input
//                   type="file"
//                   name="profileImage"
//                   accept="image/*"
//                   class="hidden"
//                   onchange="this.form.submit()"
//                 />
//               </label>
//             </form>
//           </div>
//         </div>
//         <div>
//           <h2 class="text-2xl font-bold mb-2 text-accent">
//             <%= user.firstname %> <%= user.lastname %>
//           </h2>
//           <p class="text-gray-300 mb-1">
//             <i class="fas fa-user-circle mr-2"></i>
//             <span class="font-semibold">Username:</span> <%= user.username %>
//           </p>
//           <p class="text-gray-300 mb-1">
//             <i class="fas fa-envelope mr-2"></i>
//             <span class="font-semibold">Email:</span> <%= user.email %>
//           </p>
//           <p class="text-gray-300 mb-1">
//             <i class="fas fa-phone mr-2"></i>
//             <span class="font-semibold">Mobile:</span> <%= user.mobilenumber %>
//           </p>
//           <p class="text-gray-300 mb-1">
//             <i class="fas fa-wallet mr-2"></i>
//             <span class="font-semibold">Balance:</span> ₦<%=
//             user.balance.toLocaleString() %>
//           </p>
//           <p class="text-gray-300 mb-1">
//             <i class="fas fa-gift mr-2"></i>
//             <span class="font-semibold">Bonus:</span> ₦<%=
//             user.bonus.toLocaleString() %>
//           </p>
//         </div>
//       </div>

//       <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         <!-- Transactions -->
//         <div class="bg-[#23232a] rounded-xl shadow-lg p-6">
//           <h3 class="text-xl font-semibold mb-4 text-accent flex items-center">
//             <i class="fas fa-history mr-2"></i>Transactions
//           </h3>
//           <% if (purchases && purchases.length > 0) { %>
//           <ul class="space-y-3 max-h-64 overflow-y-auto">
//             <% purchases.forEach(function(purchase) { %>
//             <li
//               class="flex justify-between items-center border-b border-gray-700 pb-2"
//             >
//               <div>
//                 <span class="font-semibold text-primary"
//                   ><%= purchase.product ? purchase.product.name : 'Product'
//                   %></span
//                 >
//                 <span class="text-xs text-gray-400 ml-2"
//                   >x<%= purchase.quantity %></span
//                 >
//                 <div class="text-xs text-gray-400">
//                   <%= purchase.purchasedAt.toLocaleDateString() %>
//                 </div>
//               </div>
//               <div class="text-green-400 font-bold">
//                 -₦<%= purchase.product ? (purchase.product.price *
//                 purchase.quantity).toLocaleString() : '0' %>
//               </div>
//             </li>
//             <% }) %>
//           </ul>
//           <% } else { %>
//           <p class="text-gray-400">No transactions yet.</p>
//           <% } %>
//         </div>

//         <!-- Referrals -->
//         <div class="bg-[#23232a] rounded-xl shadow-lg p-6">
//           <h3 class="text-xl font-semibold mb-4 text-accent flex items-center">
//             <i class="fas fa-user-friends mr-2"></i>Referrals
//           </h3>
//           <% if (referrals && referrals.length > 0) { %>
//           <ul class="space-y-3 max-h-64 overflow-y-auto">
//             <% referrals.forEach(function(ref) { %>
//             <li
//               class="flex justify-between items-center border-b border-gray-700 pb-2"
//             >
//               <div>
//                 <span class="font-semibold text-primary"
//                   ><%= ref.referredUsername || ref.referredEmail || 'User'
//                   %></span
//                 >
//                 <div class="text-xs text-gray-400">
//                   <%= ref.createdAt ? ref.createdAt.toLocaleDateString() : '' %>
//                 </div>
//               </div>
//               <span class="text-green-400 font-bold">+25%</span>
//             </li>
//             <% }) %>
//           </ul>
//           <% } else { %>
//           <p class="text-gray-400">No referrals yet.</p>
//           <% } %>
//         </div>
//       </div>

//       <!-- Purchased Products -->
//       <div class="bg-[#23232a] rounded-xl shadow-lg p-6 mb-8">
//         <h3 class="text-xl font-semibold mb-4 text-accent flex items-center">
//           <i class="fas fa-box-open mr-2"></i>Purchased Products
//         </h3>
//         <% if (purchases && purchases.length > 0) { %>
//         <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <% purchases.forEach(function(purchase) { %>
//           <div class="bg-[#18181b] rounded-lg p-4 flex flex-col shadow">
//             <div class="flex items-center mb-2">
//               <i class="fas fa-cube text-accent text-2xl mr-2"></i>
//               <span class="font-semibold text-primary"
//                 ><%= purchase.product ? purchase.product.name : 'Product'
//                 %></span
//               >
//             </div>
//             <div class="text-gray-400 text-sm mb-1">
//               Quantity: <%= purchase.quantity %>
//             </div>
//             <div class="text-gray-400 text-sm mb-1">
//               Purchased: <%= purchase.purchasedAt.toLocaleDateString() %>
//             </div>
//             <div class="text-gray-400 text-sm mb-1">
//               Price: ₦<%= purchase.product ?
//               purchase.product.price.toLocaleString() : '0' %>
//             </div>
//             <div class="text-gray-400 text-sm">
//               Total: ₦<%= purchase.product ? (purchase.product.price *
//               purchase.quantity).toLocaleString() : '0' %>
//             </div>
//           </div>
//           <% }) %>
//         </div>
//         <% } else { %>
//         <p class="text-gray-400">No products purchased yet.</p>
//         <% } %>
//       </div>
//     </main>

//     <footer class="p-4 text-center text-gray-500 text-sm bg-[#23232a]">
//       &copy; <%= new Date().getFullYear() %> Vertex. All rights reserved.
//     </footer>
//   </body>
// </html>
