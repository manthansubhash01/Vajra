const express = require("express");
const router = express.Router();
const {
  getProducts,
  getHomeProducts,
  getSearchSuggestions,
} = require("../controllers/product.controller");

router.get("/products/home", getHomeProducts);
router.get("/home/feed", getHomeProducts);
router.get("/products/search/suggestions", getSearchSuggestions);
router.get("/products", getProducts);

module.exports = router;
