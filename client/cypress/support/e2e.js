beforeEach(() => {
  cy.intercept("GET", "**/api/health", {
    statusCode: 200,
    body: { status: "ok", message: "health" },
  }).as("healthCheck");
});
