describe("Signup", () => {
  beforeEach(() => {
    // Clean up any existing test users before each test
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/graphql',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        query: `
          mutation DeleteTestUser {
            deleteUserByTestEmail
          }
        `
      },
    });
  });

  it("tests Signup", () => {
    cy.viewport(1342, 468);
    cy.visit("http://localhost:3000/auth/signup");
    cy.get("#firstName").click();
    cy.get("#firstName").type("Firstname");
    cy.get("#lastName").type("Lastname");
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("test@example.comA1");
    cy.get("form > button").click();
    cy.get("div:nth-of-type(3) button").click();
  });
});
