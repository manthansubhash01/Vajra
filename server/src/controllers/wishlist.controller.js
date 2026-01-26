const User = require("../models/user.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
        return res.status(404).json({ message: "Product not found" });
        }

        const user = await User.findById(req.userId);
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        if (user.wishlist.includes(productId)) {
        return res.status(400).json({ message: "Product already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
        message: "Product added to wishlist",
        wishlist: user.wishlist,
        });
    } catch (err) {
        console.error(err);
        return res
        .status(500)
        .json({ message: "Failed to add product to wishlist" });
    }
    };

    const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
        }

        const user = await User.findById(req.userId);
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        if (!user.wishlist.includes(productId)) {
        return res.status(400).json({ message: "Product not in wishlist" });
        }

        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();

        return res.status(200).json({
        message: "Product removed from wishlist",
        wishlist: user.wishlist,
        });
    } catch (err) {
        console.error(err);
        return res
        .status(500)
        .json({ message: "Failed to remove product from wishlist" });
    }
    };

    const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("wishlist");

        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
        wishlist: user.wishlist,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to get wishlist" });
    }
    };

    const clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        user.wishlist = [];
        await user.save();

        return res.status(200).json({
        message: "Wishlist cleared",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to clear wishlist" });
    }
    };

    module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    clearWishlist,
};
