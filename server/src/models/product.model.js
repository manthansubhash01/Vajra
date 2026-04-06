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
    trim: true
  },

  slug: {
    type: String,
    unique: true
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

  brand: {
    type: String,
    index: true
  },

  images: [String],

  gender: {
    type: String,
    enum: ["male", "female", "unisex"]
  },

  variants: [variantSchema],

  minPrice: {
    type: Number,
    index: true
  },

  maxPrice: {
    type: Number,
    index: true
  },

  totalStock: {
    type: Number,
    default: 0,
    index: true
  },

  attributes: {
    type: Map,
    of: String
  },

  rating: {
    type: Number,
    default: 0,
    index: true
  },

  numReviews: {
    type: Number,
    default: 0
  },

  totalSold: {
    type: Number,
    default: 0,
    index: true
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

}, {
  timestamps: true
});


productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  category: "text",
  "variants.flavor": "text",
  "variants.weight": "text",
  "variants.material": "text",
  "variants.resistance_level": "text"
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