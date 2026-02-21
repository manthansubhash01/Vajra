const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getHomeProducts,
  getSearchSuggestions,
} = require("../controllers/product.controller");

router.get("/products/home", getHomeProducts);
router.get("/home/feed", getHomeProducts);
router.get("/products/search/suggestions", getSearchSuggestions);
router.get("/products", getProducts);
router.get("/products/:slug", getProductBySlug);

module.exports = router;
