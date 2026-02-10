const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        items: [
        {
            product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            },
            variantSku: {
            type: String,
            required: true,
            },
            quantity: {
            type: Number,
            required: true,
            min: 1,
            },
            price: {
            type: Number,
            required: true,
            },
            name: String,
            brand: String,
        },
        ],
        shippingAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        },
        paymentMethod: {
        type: String,
        enum: ["COD", "Card", "UPI", "Wallet"],
        required: true,
        },
        paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending",
        },
        orderStatus: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
        },
        totalAmount: {
        type: Number,
        required: true,
        },
        deliveredAt: Date,
    },
    { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
