describe("Login to shopping and orders flow", () => {
  it("completes Login -> Shopping -> Order journey", () => {
    const product = {
      _id: "prod-1",
      slug: "whey-protein",
      name: "Whey Protein",
      brand: "Vajra",
      category: "supplements",
      minPrice: 1999,
      maxPrice: 2499,
      rating: 4.5,
      variants: [
        {
          sku: "WHEY-1KG",
          price: 1999,
          images: ["https://example.com/whey.jpg"],
        },
      ],
      images: ["https://example.com/whey.jpg"],
    };

    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "e2e-token",
      },
    }).as("loginRequest");

    cy.intercept("GET", "**/api/products*", {
      statusCode: 200,
      body: {
        products: [product],
        correctedKeyword: null,
      },
    }).as("productsRequest");

    cy.intercept("POST", "**/api/cart", {
      statusCode: 200,
      body: {
        message: "Added",
      },
    }).as("addToCartRequest");

    cy.intercept("GET", "**/api/cart", {
      statusCode: 200,
      body: {
        cart: [
          {
            product,
            variantSku: "WHEY-1KG",
            quantity: 1,
          },
        ],
      },
    }).as("cartRequest");

    cy.intercept("GET", "**/api/orders/user/my-orders", {
      statusCode: 200,
      body: {
        orders: [
          {
            _id: "order-12345678",
            createdAt: "2026-01-01T00:00:00.000Z",
            orderStatus: "Delivered",
            deliveredAt: "2026-01-02T00:00:00.000Z",
            paymentMethod: "UPI",
            totalAmount: 1999,
            items: [
              {
                name: "Whey Protein",
                variantSku: "WHEY-1KG",
                quantity: 1,
                price: 1999,
              },
            ],
          },
        ],
      },
    }).as("ordersRequest");

    cy.visit("/login");

    cy.get('input[placeholder="Enter your name or phone"]').type("Manthan");
    cy.get('input[placeholder="Enter password"]').type("123456");
    cy.contains("button", "Sign In").click();

    cy.wait("@loginRequest");
    cy.url().should("include", "/onboarding/interests");

    cy.contains("button", "Save & Continue").click();
    cy.url().should("include", "/shop");

    cy.wait("@productsRequest");
    cy.contains("button", "Buy Now").first().click();
    cy.wait("@addToCartRequest");
    cy.url().should("include", "/cart");

    cy.wait("@cartRequest");
    cy.contains("Your Cart").should("be.visible");

    cy.window().then((win) => {
      win.localStorage.setItem("token", "e2e-token");
    });

    cy.visit("/orders");
    cy.wait("@ordersRequest");
    cy.contains("My Orders").should("be.visible");
    cy.contains("Whey Protein").should("be.visible");
  });
});
