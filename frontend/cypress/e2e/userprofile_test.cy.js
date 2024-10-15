// Function to login user
Cypress.Commands.add('loginAsUser', () => {
  cy.visit('http://localhost:3000/login')
  cy.get('input[type="email"]').type('jak.doe@example.com');  
  cy.get('input[type="password"]').type('Password1234!');  
  cy.get('button[type="submit"]').click(); 

  cy.contains('User Profile').should('be.visible');

  cy.wait(500);

  // Wait for redirection and verify the employee dashboard is loaded
  cy.url().should('include', 'http://localhost:3000/user/jak.doe@example.com');
});

describe('User Profile Page', () => {

  // Tests if a user is able to login and see their profile page
  it('should log in and access user profile page', () => {
    cy.visit('http://localhost:3000');
    cy.get('img[alt="User Icon"]').click();
    cy.contains('Login').click();

    cy.get('input[type="email"]').type('jak.doe@example.com');  // Valid email
    cy.get('input[type="password"]').type('Password1234!');     // Valid password
    cy.get('button[type="submit"]').click();                    // Login

    cy.get('#errorMessage').should('not.exist'); // Ensure error message is not displayed

    cy.url().should('include', 'http://localhost:3000/user/jak.doe@example.com');   // Checks URL
    cy.contains('User Profile').should('be.visible');
  });

  // Tests if users can update their user profile
  it('should update user profile', () => {
    cy.loginAsUser();         // Call function

    cy.get('input[name="lastName"]').clear().type('Black'); // Update last name
    cy.get('input[name="mobileNumber"]').clear().type('1122334456'); // Update mobile number
    cy.get('input[name="dateOfBirth"]').clear().type('2005-05-16'); // Update DOB
    cy.get('input[name="shippingAddress"]').clear().type('123 wall street'); // Update width

    cy.get('button[type="submit"]').click();

    cy.reload();

  });
});
