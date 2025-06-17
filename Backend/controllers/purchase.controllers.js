const Purchase = require('../models/purchase.models');
const Product = require('../models/product.models'); // Adjust path as needed

// Create a new purchase
exports.createPurchase = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id; // Assumes user ID is available in req.user

        // Optionally, check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const purchase = new Purchase({
            user: userId,
            product: productId,
            quantity: quantity || 1
        });

        await purchase.save();
        res.status(201).json(purchase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all purchases for a user
exports.getUserPurchases = async (req, res) => {
    try {
        const userId = req.user._id; // Assumes user ID is available in req.user

        const purchases = await Purchase.find({ user: userId })
            .populate('product') // Populates product details
            .sort({ purchasedAt: -1 });

        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};