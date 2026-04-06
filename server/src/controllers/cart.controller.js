const User = require("../models/user.model");
const Product = require("../models/product.model");

const addToCart = async (req, res) => {
  try {
    const { productId, variantSku, quantity } = req.body;

    if (!productId || !variantSku) {
      return res
        .status(400)
        .json({ message: "Product ID and variant SKU are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const requestedQuantity = quantity || 1;
    if (requestedQuantity > variant.stock) {
      return res.status(400).json({
        message: `Only ${variant.stock} items available in stock`,
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cart.find(
      (item) =>
        item.product.toString() === productId && item.variantSku === variantSku,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;
      if (newQuantity > variant.stock) {
        return res.status(400).json({
          message: `Only ${variant.stock} items available in stock`,
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId,
        variantSku,
        quantity: requestedQuantity,
      });
    }

    await user.save();

    const populatedUser = await User.findById(req.userId).populate(
      "cart.product",
    );

    return res.status(200).json({
      message: "Product added to cart",
      cart: populatedUser.cart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to add product to cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      cart: user.cart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get cart" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, variantSku } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (quantity > variant.stock) {
      return res.status(400).json({
        message: `Only ${variant.stock} items available in stock`,
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cart.find(
      (item) =>
        item.product.toString() === productId && item.variantSku === variantSku,
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();

    const populatedUser = await User.findById(req.userId).populate(
      "cart.product",
    );

    return res.status(200).json({
      message: "Cart quantity updated",
      cart: populatedUser.cart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update quantity" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId, variantSku } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.cart.length;
    user.cart = user.cart.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
            item.variantSku === variantSku
        ),
    );

    if (user.cart.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await user.save();

    const populatedUser = await User.findById(req.userId).populate(
      "cart.product",
    );

    return res.status(200).json({
      message: "Product removed from cart",
      cart: populatedUser.cart,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to remove product from cart" });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();

    return res.status(200).json({
      message: "Cart cleared",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
