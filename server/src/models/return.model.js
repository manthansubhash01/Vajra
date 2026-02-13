const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
    {
        order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        },
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
        },
        ],
        returnReason: {
        type: String,
        enum: [
            "Defective Product",
            "Wrong Item Received",
            "Size/Color Issue",
            "Quality Not as Expected",
            "Changed Mind",
            "Better Price Elsewhere",
            "Product Damaged",
            "Not as Described",
            "Other",
        ],
        required: true,
        },
        returnType: {
        type: String,
        enum: ["Refund", "Exchange"],
        default: "Refund",
        },
        description: {
        type: String,
        maxlength: 500,
        },
        images: [String],
        status: {
        type: String,
        enum: [
            "Requested",
            "Approved",
            "Rejected",
            "Pickup Scheduled",
            "Picked Up",
            "Refund Processing",
            "Refunded",
            "Completed",
        ],
        default: "Requested",
        },
        refundAmount: {
        type: Number,
        required: true,
        },
        refundMethod: {
        type: String,
        enum: ["Original Payment Method", "Wallet", "Bank Transfer"],
        default: "Original Payment Method",
        },
        adminNotes: {
        type: String,
        maxlength: 500,
        },
        rejectionReason: String,
        pickupDate: Date,
        refundedAt: Date,
        completedAt: Date,
    },
    { timestamps: true },
);

module.exports = mongoose.model("Return", returnSchema);
