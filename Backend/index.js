const express = require("express");
const session = require("express-session");
// const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const crypto = require("crypto");
const app = express();
const PORT = 3000;

// Load environment variables
dotenv.config();
console.log(
  "JWT_SECRET from .env:",
  process.env.JWT_SECRET ? "Loaded" : "NOT LOADED"
);

// Database and Models
const connectDB = require("./config/db");
const User = require("./models/users.models");
const Purchase = require("./models/purchase.models");
const upload = multer({ dest: "public/uploads/" });

// Route imports
const purchaseRoutes = require("./routes/purchase.routes");
const accountsRoutes = require("./routes/accounts.routes");
const depositsRoutes = require("./routes/deposits.routes");
const referralRoutes = require("./routes/referral.routes");
const authRoutes = require("./routes/users.routes");
const Referral = require("./models/referral.models");
const bankRoutes = require("./routes/bank.routes");
const notificationRoutes = require("./routes/notifications.routes");
const adminRoutes = require("./routes/admin.routes");
const Product = require("./models/product.models");
// const products = require("./seed_products");
// const allowedOrigins = [
//   "https://vertex-4.onrender.com", // Your Render frontend domain
//   "http://localhost:3000", // For local development
// ];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const isProduction = process.env.NODE_ENV === "production";
// const allowedOrigins = [
//   "https://vertex-4.onrender.com",
//   "http://localhost:3000",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       console.log("CORS request from origin:", origin);
//       // Allow requests with no origin (like mobile apps, curl, Postman)
//       if (!origin) {
//         console.log("CORS: No origin, allowing request.");
//         return callback(null, true);
//       }
//       if (allowedOrigins.includes(origin)) {
//         console.log("CORS: Origin allowed:", origin);
//         return callback(null, true);
//       } else {
//         console.warn("CORS: Origin NOT allowed:", origin);
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST"],
//   })
// );

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true in production (HTTPS), false in dev
      sameSite: "lax", // "none" for cross-site cookies in prod, "lax" for dev
    },
  })
);

// Static file serving
app.use("/main", express.static(path.join(__dirname, "views", "main")));
app.use("/land", express.static(path.join(__dirname, "views", "land")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// bank lists
app.use("/api/bank", bankRoutes);
// noftications
app.use("/api/notifications", notificationRoutes);
// Admin routes
app.use("/api/admin", adminRoutes);
// Purchase routes
app.use("/api/purchases", purchaseRoutes);
// products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Redirect root to login
app.get("/", (req, res) => {
  console.log("[GET /] Redirecting to /login");
  res.redirect("/login");
});

// Home page (EJS)
app.get("/home", async (req, res) => {
  console.log("[GET /home] Session username:", req.session.username);
  if (!req.session.username) {
    console.log("[GET /home] No session username, redirecting to /login");
    return res.redirect("/login");
  }
  const user = await User.findOne({ username: req.session.username });
  console.log("[GET /home] User found:", !!user);
  if (!user) {
    console.log("[GET /home] No user found, redirecting to /login");
    return res.redirect("/login");
  }

  // Fetch all purchases for this user, including product info
  const purchases = await Purchase.find({ user: user._id }).populate("product");
  console.log("[GET /home] Purchases found:", purchases.length);
  const products = await Product.find();
  console.log("[GET /home] products found:", products.length);

  // Calculate stats (copy from your /dashboard route)
  const stats = {
    totalProducts: purchases.length,
    stableProducts: purchases.filter(
      (p) => p.product.category === "premium" || p.product.category === "stable"
    ).length,
    welfareProducts: purchases.filter(
      (p) => p.product.category === "alpha" || p.product.category === "welfare"
    ).length,
    wagesProducts: purchases.filter((p) => p.product.category === "wages")
      .length,
    totalInvestment: purchases.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0
    ),
    totalReturns: purchases.reduce(
      (sum, p) => sum + p.product.totalReturn * p.quantity,
      0
    ),
  };

  let credited = false;
  const now = new Date();

  for (const purchase of purchases) {
    const lastCreditedDate = purchase.lastCredited || purchase.purchasedAt;
    const daysPassed = Math.floor(
      (now - lastCreditedDate) / (1000 * 60 * 60 * 24)
    );
    if (daysPassed > 0) {
      const dailyReturn = purchase.product.dailyReturn * purchase.quantity;
      user.balance += dailyReturn * daysPassed;
      purchase.lastCredited = now;
      credited = true;
      await purchase.save();
      console.log(
        `[GET /home] Credited purchase ${purchase._id} with ${
          dailyReturn * daysPassed
        }`
      );
    }
  }

  if (credited) {
    await user.save();
    console.log("[GET /home] User balance updated and saved.");
  }
  const balance = user ? user.balance : 0;
  console.log("[GET /home] Rendering dashboard with balance:", balance);
  console.log("User sent to EJS:", user);
  const referralCount = await Referral.countDocuments({ referrer: user._id });
  res.render("main/vertex", {
    user,
    products,
    balance,
    transactions: purchases,
    referralCount,
    stats,
  });
  console.log("[GET /home] Home page rendered successfully");
});

// Login/signup page (EJS)
app.get("/login", (req, res) => {
  if (req.session.username && req.session.isAdmin) {
    return res.redirect("/admin");
  }

  console.log("[GET /login] Session username:", req.session.username);
  if (req.session.username) {
    console.log("[GET /login] Already logged in, redirecting to /home");
    return res.redirect("/home");
  }
  res.render("land/index", { user: null }, (err, html) => {
    if (err) {
      console.error("[GET /login] Error rendering index.ejs:", err);
      return res.status(err.status || 500).end();
    }
    res.send(html);
    console.log("[GET /login] Login page rendered successfully");
  });
});

// Login POST
app.post("/api/auth/login", async (req, res) => {
  const { username, password, referredBy } = req.body;
  console.log("[POST /api/auth/login] Received:", { username, password });

  // Check for special admin credentials
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.username = username;
    req.session.isAdmin = true;
    console.log(
      "[POST /api/auth/login] Admin credentials matched. Redirecting to /admin"
    );
    return res.json({ message: "Admin login", redirect: "/admin" });
  }

  // Normal user login
  const user = await User.findOne({ username });
  console.log("[POST /api/auth/login] User found:", !!user);

  if (user && (await user.comparePassword(password))) {
    req.session.username = username;
    req.session.isAdmin = user.isAdmin || false;
    req.session.userId = user._id; // Store user ID in session
    req.session.save((err) => {
      if (err) {
        console.error("[POST /api/auth/login] Session save error:", err);
        return res.status(500).send("Session error");
      }
      console.log("[POST /api/auth/login] Session SET:", {
        username: req.session.username,
        isAdmin: req.session.isAdmin,
      });
      return res.json({ message: "Login successful!", redirect: "/home" });
    });
  } else {
    // ADD THIS:
    return res.status(401).json({ message: "Invalid credentials" });
  }
});
app.get("/test-session", (req, res) => {
  res.json({ username: req.session.username });
});
// user profile
app.get("/profile", async (req, res) => {
  if (!req.session.username) return res.redirect("/login");
  const user = await User.findOne({ username: req.session.username });
  if (!user) return res.redirect("/login");

  // Fetch transactions, purchases, and referrals
  const purchases = await Purchase.find({ user: user._id }).populate("product");
  // Assuming you have a Referral model
  const referrals = await Referral.find({ referrer: user._id });

  res.render("main/profile", {
    user,
    purchases,
    referrals,
  });
});

// Serve reset password form
app.get("/forgot-password", async (req, res) => {
  const { token, email } = req.query;
  res.render("land/reset-password", { token, email }); // Create this EJS file
});

// Handle new password submission
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "No user with that email." });

  // Generate a reset token and expiry

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  // Build the reset URL
  const resetUrl = `https://vertex-4.onrender.com/reset-password?token=${token}&email=${encodeURIComponent(
    email
  )}`;

  // Configure transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email." });
  }
});

// profile image upload
app.post("/profile/upload", upload.single("profileImage"), async (req, res) => {
  if (!req.session.username) return res.redirect("/login");
  const user = await User.findOne({ username: req.session.username });
  if (!user) return res.redirect("/login");

  if (req.file) {
    user.profileImage = "/uploads/" + req.file.filename;
    await user.save();
  }
  res.redirect("/profile");
});

// // Admin-only middleware
function adminOnly(req, res, next) {
  if (!req.session.username || !req.session.isAdmin) {
    return res.redirect("/login");
  }
  next();
}

// Admin dashboard
app.get("/admin", adminOnly, async (req, res) => {
  const user = await User.findOne({ username: req.session.username });
  const users = await User.find(); // Fetch all users

  // for each user, get referral count
  const usersWithReferrals = await Promise.all(
    users.map(async (user) => {
      return {
        username: user.username,
        balance: user.balance,
        referralsCount: await Referral.countDocuments({ referrer: user._id }),
        profileImage: user.profileImage || "/uploads/default.png",
        _id: user._id,
      };
    })
  );
  res.render("admin/dashboard", { users: usersWithReferrals });
});

// Admin user management
app.post("/admin/users/:id/delete", adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

// Admin view user profile
app.get("/admin/users/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");

    // Fetch purchases and referrals for this user
    const purchases = await Purchase.find({ user: user._id }).populate(
      "product"
    );
    const referrals = await Referral.find({ referrer: user._id });

    res.render("admin/user-profile", {
      user,
      purchases,
      referrals,
    });
  } catch (err) {
    res.status(500).send("Error loading user profile");
  }
});

// products
// app.get('/dashboard', async (req, res) => {
//   const user = await User.findById(req.user._id).populate('purchases');
//   // Calculate stats
//   const totalProducts = user.purchases.length;
//   const stableProducts = user.purchases.filter(p => p.category === 'stable').length;
//   const welfareProducts = user.purchases.filter(p => p.category === 'welfare').length;
//   const wagesProducts = user.purchases.filter(p => p.category === 'wages').length;
//   const totalInvestment = user.purchases.reduce((sum, p) => sum + p.amount, 0);
//   const totalReturns = user.purchases.reduce((sum, p) => sum + p.returns, 0);

//   res.render('main/vertex', {
//     user,
//     stats: {
//       totalProducts,
//       stableProducts,
//       welfareProducts,
//       wagesProducts,
//       totalInvestment,
//       totalReturns
//     }
//   });
// });

app.get("/dashboard", async (req, res) => {
  // Fetch user and their purchases
  const user = await User.findById(req.user._id).populate("purchases.product");
  const purchases = user.purchases || [];

  // Calculate stats
  const stats = {
    totalProducts: purchases.length,
    stableProducts: purchases.filter(
      (p) => p.product.category === "premium" || p.product.category === "stable"
    ).length,
    welfareProducts: purchases.filter(
      (p) => p.product.category === "alpha" || p.product.category === "welfare"
    ).length,
    wagesProducts: purchases.filter((p) => p.product.category === "wages")
      .length,
    totalInvestment: purchases.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0
    ),
    totalReturns: purchases.reduce(
      (sum, p) => sum + p.product.totalReturn * p.quantity,
      0
    ),
  };

  // Render EJS and pass stats
  res.render("main/vertex", {
    user,
    products: await Product.find({}), // or however you get products
    transactions: purchases,
    stats, // <-- pass stats here
    referralCount: user.referrals ? user.referrals.length : 0,
    balance: user.balance || 0,
  });
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Could not log out.");
    }
    res.redirect("/login");
  });
});

// Deposit endpoint
app.post("/deposit", async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Credit deposit to user's balance
  user.balance = (user.balance || 0) + amount;
  await user.save();

  // Referral bonus logic
  if (user.referredBy) {
    const referrer = await User.findOne({ username: user.referredBy });
    if (referrer) {
      const bonus = amount * 0.25;
      referrer.bonus = (referrer.bonus || 0) + bonus;
      await referrer.save();
      // Optionally: log the bonus transaction here
    }
  }

  res.json({ success: true });
});

// Deposit request API
app.post("/api/deposit-request", async (req, res) => {
  const { accountName, bankName } = req.body;
  console.log("[POST /api/deposit-request] Payload:", req.body);
  try {
    const payload = { accountName, bankName };
    const response = await axios.post(
      "https://wema-alatdev-apimgt.azure-api.net/alat-pay/api/EcommerceTransfer/transfer-fund-request",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 1b085fd1a532429db580e08979e4d183",
          "Ocp-Apim-Subscription-Key": "14e2b202eec34bc596b278ae5df5a9d4",
        },
      }
    );
    console.log(
      "[POST /api/deposit-request] Wema API response:",
      response.data
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(
      "[POST /api/deposit-request] Error:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ success: false, message: "Bank API request failed" });
  }
});

// Wema webhook
app.post("/wema/webhook", async (req, res) => {
  const payload = req.body;
  console.log(
    "[POST /wema/webhook] Incoming payload:",
    JSON.stringify(payload, null, 2)
  );
  if (payload.transactionType === "CREDIT") {
    console.log(
      `[POST /wema/webhook] Received credit of ₦${payload.amount} from ${payload.senderName}`
    );
  }
  res.status(200).send("Webhook received");
});

// API routes
// app.use("/api/purchases", purchaseRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/deposits", depositsRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/auth", authRoutes);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
  });
});
