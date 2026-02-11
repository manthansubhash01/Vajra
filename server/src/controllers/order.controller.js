const Order = require("../models/order.model");
const User = require("../models/user.model");

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
        .populate("items.product")
        .sort({ createdAt: -1 });

        return res.status(200).json({
        orders,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate("items.product");

        if (!order) {
        return res.status(404).json({ message: "Order not found" });
        }

        if (order.user.toString() !== req.userId) {
        return res
            .status(403)
            .json({ message: "Not authorized to view this order" });
        }

        return res.status(200).json({
        order,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch order details" });
    }
};

const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
        }

        if (!shippingAddress || !paymentMethod) {
        return res
            .status(400)
            .json({ message: "Shipping address and payment method are required" });
        }

        let totalAmount = 0;
        const orderItems = items.map((item) => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        return {
            product: item.product,
            variantSku: item.variantSku,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            brand: item.brand,
        };
        });

        const newOrder = new Order({
        user: req.userId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        totalAmount,
        paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
        orderStatus: "Confirmed",
        });

        await newOrder.save();

        await User.findByIdAndUpdate(req.userId, { cart: [] });

        return res.status(201).json({
        message: "Order placed successfully",
        order: newOrder,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create order" });
    }
    };

    const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
        return res.status(404).json({ message: "Order not found" });
        }

        if (order.user.toString() !== req.userId) {
        return res
            .status(403)
            .json({ message: "Not authorized to cancel this order" });
        }

        if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
        return res.status(400).json({
            message: `Cannot cancel order with status: ${order.orderStatus}`,
        });
        }

        order.orderStatus = "Cancelled";
        await order.save();

        return res.status(200).json({
        message: "Order cancelled successfully",
        order,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to cancel order" });
    }
};

module.exports = {
    getUserOrders,
    getOrderById,
    createOrder,
    cancelOrder,
};
