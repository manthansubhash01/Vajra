const Return = require("../models/return.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");

const createReturnRequest = async (req, res) => {
    try {
        const { orderId, items, returnReason, returnType, description, images } =
        req.body;

        if (!orderId || !items || items.length === 0 || !returnReason) {
        return res.status(400).json({
            message: "Order ID, items, and return reason are required",
        });
    }

    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.userId) {
        return res
        .status(403)
        .json({ message: "Not authorized to return this order" });
    }

    if (order.orderStatus !== "Delivered") {
        return res
        .status(400)
        .json({ message: "Only delivered orders can be returned" });
    }

    const deliveryDate = new Date(order.deliveredAt);
    const currentDate = new Date();
    const daysSinceDelivery = Math.floor(
    (currentDate - deliveryDate) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceDelivery > 7) {
        return res.status(400).json({
            message: "Return window expired. Returns accepted within 7 days only",
        });
    }

    const existingReturn = await Return.findOne({
    order: orderId,
    status: { $nin: ["Rejected", "Completed"] },
    });

    if (existingReturn) {
        return res.status(400).json({
            message: "A return request already exists for this order",
        });
    }

    let refundAmount = 0;
    const returnItems = items.map((item) => {
    const orderItem = order.items.find(
        (oi) =>
        oi.product._id.toString() === item.productId &&
        oi.variantSku === item.variantSku,
    );

    if (!orderItem) {
        throw new Error("Invalid item in return request");
    }

    if (item.quantity > orderItem.quantity) {
        throw new Error("Return quantity exceeds ordered quantity");
    }

    const itemRefund = orderItem.price * item.quantity;
    refundAmount += itemRefund;

    return {
            product: item.productId,
            variantSku: item.variantSku,
            quantity: item.quantity,
            price: orderItem.price,
            name: orderItem.name,
        };
    });

    const newReturn = new Return({
        order: orderId,
        user: req.userId,
        items: returnItems,
        returnReason,
        returnType: returnType || "Refund",
        description,
        images: images || [],
        refundAmount,
    });

    await newReturn.save();

    return res.status(201).json({
        message: "Return request created successfully",
        return: newReturn,
    });
    } catch (err) {
        console.error(err);
        return res
        .status(500)
        .json({ message: err.message || "Failed to create return request" });
    }
};

const getUserReturns = async (req, res) => {
    try {
        const returns = await Return.find({ user: req.userId })
        .populate("order")
        .populate("items.product")
        .sort({ createdAt: -1 });

        return res.status(200).json({
        returns,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch returns" });
    }
};

const getReturnById = async (req, res) => {
    try {
        const { returnId } = req.params;

        const returnRequest = await Return.findById(returnId)
        .populate("order")
        .populate("items.product")
        .populate("user", "name email phone");

        if (!returnRequest) {
        return res.status(404).json({ message: "Return request not found" });
        }

        if (returnRequest.user._id.toString() !== req.userId) {
        return res
            .status(403)
            .json({ message: "Not authorized to view this return" });
        }

        return res.status(200).json({
        return: returnRequest,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch return details" });
    }
};

const cancelReturnRequest = async (req, res) => {
    try {
        const { returnId } = req.params;

        const returnRequest = await Return.findById(returnId);

        if (!returnRequest) {
        return res.status(404).json({ message: "Return request not found" });
        }

        if (returnRequest.user.toString() !== req.userId) {
        return res
            .status(403)
            .json({ message: "Not authorized to cancel this return" });
        }

        if (
        !["Requested", "Approved", "Pickup Scheduled"].includes(
            returnRequest.status,
        )
        ) {
        return res.status(400).json({
            message: `Cannot cancel return in ${returnRequest.status} status`,
        });
        }

        returnRequest.status = "Rejected";
        returnRequest.rejectionReason = "Cancelled by user";
        await returnRequest.save();

        return res.status(200).json({
        message: "Return request cancelled successfully",
        return: returnRequest,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to cancel return request" });
    }
};

module.exports = {
    createReturnRequest,
    getUserReturns,
    getReturnById,
    cancelReturnRequest,
};
