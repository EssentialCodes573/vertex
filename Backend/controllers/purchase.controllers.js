const User = require("../models/users.models");
const Product = require("../models/product.models");
const Purchase = require("../models/purchase.models");
const Notification = require("../models/notification.model");

exports.createPurchase = async (req, res) => {
  console.log("createPurchase called");
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    console.log("Request body:", req.body);
    console.log("User ID:", userId);

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("Product found:", product);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user);

    const totalPrice = product.price * (quantity || 1);
    console.log("Total price:", totalPrice);

    if (user.balance < totalPrice) {
      console.log(
        "Insufficient balance. User balance:",
        user.balance,
        "Total price:",
        totalPrice
      );
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.balance -= totalPrice;
    await user.save();
    console.log("User balance after deduction:", user.balance);

    const purchase = new Purchase({
      user: userId,
      product: productId,
      quantity: quantity || 1,
    });
    await purchase.save();
    console.log("Purchase saved:", purchase);

    const isFirstPurchase =
      (await Purchase.countDocuments({ user: user._id })) === 0;
    // award referral bonus if it's the user's first purchase
    if (user.referredBy && isFirstPurchase) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const bonus = Math.floor(product.price * 0.25); // 25% bonus
        referrer.bonus = (referrer.bonus || 0) + bonus;
        await referrer.save();

        // Optionally, notify the referrer
        await Notification.create({
          type: "referral",
          message: `You earned a ₦${bonus} bonus from your referral's first purchase!`,
          user: referrer._id,
        });
        console.log(
          `Referral bonus of ₦${bonus} credited to referrer ${referrer._id}`
        );
      }
    }
    await Notification.create({
      type: "payment",
      message: `Incoming payment of ₦${totalPrice}`,
    });
    console.log("Notification created for payment of ₦" + totalPrice);

    res.status(201).json({
      message: "Purchase successful",
      purchase,
      balance: user.balance,
    });
    console.log("Purchase successful response sent");
  } catch (error) {
    console.error("Error in createPurchase:", error);
    res.status(500).json({ message: error.message });
  }
};

// exports.getUserPurchases = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const purchases = await Purchase.find({ user: userId }).populate("product");
//     res.json(purchases);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
