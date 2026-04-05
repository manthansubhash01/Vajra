const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("../../src/app");
const User = require("../../src/models/user.model");
const Product = require("../../src/models/product.model");
const Order = require("../../src/models/order.model");

const createTestUser = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  return User.create({
    name: "Integration User",
    phone: "9999999900",
    email: "integration@test.com",
    password: hashedPassword,
    age: 26,
    address: "Pune",
  });
};

const createTestProduct = async () =>
  Product.create({
    name: "Whey Protein",
    slug: "whey-protein",
    description: "Fast absorbing whey protein for recovery and strength.",
    category: "supplement",
    brand: "Vajra",
    gender: "unisex",
    images: ["https://example.com/whey.jpg"],
    variants: [
      {
        sku: "WHEY-1KG",
        flavor: "Chocolate",
        price: 1999,
        stock: 12,
        images: ["https://example.com/whey.jpg"],
      },
    ],
    minPrice: 1999,
    maxPrice: 1999,
    totalStock: 12,
    rating: 4.8,
    isFeatured: true,
    isActive: true,
  });

describe("Backend API and DB integration", () => {
  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
  });

  test("reads products from the database and persists cart and order changes", async () => {
    const product = await createTestProduct();
    await createTestUser();

    const loginResponse = await request(app).post("/api/auth/login").send({
      name: "Integration User",
      password: "123456",
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeDefined();

    const token = loginResponse.body.token;

    const productsResponse = await request(app).get("/api/products").query({
      limit: 10,
    });

    expect(productsResponse.statusCode).toBe(200);
    expect(productsResponse.body.products).toHaveLength(1);
    expect(productsResponse.body.products[0].slug).toBe("whey-protein");

    const cartResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        variantSku: "WHEY-1KG",
        quantity: 2,
      });

    expect(cartResponse.statusCode).toBe(200);
    expect(cartResponse.body.cart).toHaveLength(1);
    expect(cartResponse.body.cart[0].quantity).toBe(2);

    const persistedUser = await User.findOne({ name: "Integration User" });
    expect(persistedUser.cart).toHaveLength(1);
    expect(persistedUser.cart[0].quantity).toBe(2);

    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            product: product._id.toString(),
            variantSku: "WHEY-1KG",
            quantity: 2,
            price: 1999,
            name: "Whey Protein",
            brand: "Vajra",
          },
        ],
        shippingAddress: {
          name: "Integration User",
          phone: "9999999900",
          address: "Pune",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
        },
        paymentMethod: "UPI",
      });

    expect(orderResponse.statusCode).toBe(201);
    expect(orderResponse.body.order.totalAmount).toBe(3998);

    const storedOrder = await Order.findOne({ user: persistedUser._id });
    expect(storedOrder).toBeTruthy();
    expect(storedOrder.items).toHaveLength(1);
    expect(storedOrder.totalAmount).toBe(3998);

    const refreshedUser = await User.findById(persistedUser._id);
    expect(refreshedUser.cart).toHaveLength(0);

    const ordersResponse = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(ordersResponse.statusCode).toBe(200);
    expect(ordersResponse.body.orders).toHaveLength(1);
    expect(ordersResponse.body.orders[0].totalAmount).toBe(3998);
  });
});
