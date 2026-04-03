describe("Auth guard and login failure flows", () => {
  it("redirects protected routes to login", () => {
    cy.visit("/cart");

    cy.url().should("include", "/login");
    cy.contains(
      "Please login or register to continue with your action.",
    ).should("be.visible");
  });

  it("shows an error on invalid login", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 400,
      body: {
        message: "Invalid credentials",
      },
    }).as("failedLogin");

    cy.visit("/login");

    cy.get('input[placeholder="Enter your name or phone"]').type("Manthan");
    cy.get('input[placeholder="Enter password"]').type("wrong-password");
    cy.contains("button", "Sign In").click();

    cy.wait("@failedLogin");
    cy.contains("Invalid credentials").should("be.visible");
  });
});
