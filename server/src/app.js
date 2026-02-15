const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const wishlistRoutes = require("./routes/wishlistList.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const returnRoutes = require("./routes/return.routes");
const productRoutes = require("./routes/product.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ShopSmart Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("ShopSmart Backend Service");
});

module.exports = app;
