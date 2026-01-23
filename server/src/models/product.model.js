const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
    sku: {
        type: String,        
        unique: true,
        sparse: true
    },

    size: String,   
    color: String, 
    flavor: String, 
    weight: String, 
    material: String,  
    resistance_level: String, 

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        default: 0
    },

    images: [String]
    }, { _id: false });


const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        index: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true,
        enum: ["clothing", "accessory", "supplement", "equipment"],
        index: true
    },

    brand: String,

    basePrice: Number,

    images: [String],

    stock: {
        type: Number,
        default: 0
    },

    gender: {
        type: String,
        enum: ["male", "female", "unisex"]
    },

    variants: [variantSchema],

    attributes: {
        type: Map,
        of: String
    },

    rating: {
        type: Number,
        default: 0
    },

    numReviews: {
        type: Number,
        default: 0
    },

    totalSold: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }

    }, {
        timestamps: true
    });


// productSchema.index({
//     name: "text",
//     description: "text",
//     brand: "text",
//     category: "text",
//     "variants.flavor": "text",
//     "variants.weight": "text",
//     "variants.material": "text",
//     "variants.resistance_level": "text"
// });


module.exports = mongoose.model("Product", productSchema);