describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login'); 

    cy.clearCookies();
    cy.clearLocalStorage();

  });
  
    it('should display the login form elements', () => {
      cy.get('h1').contains('Login');  // Check if the login header is displayed
      cy.get('input[type="email"]').should('be.visible');  // Email input
      cy.get('input[type="password"]').should('be.visible');  // Password input
      cy.get('button[type="submit"]').contains('Login').should('be.visible');  // Login button
      cy.get('.forgot-link a').should('have.attr', 'href', '/forgot-password');  // Forgot password link
      cy.get('.signup-link a').should('have.attr', 'href', '/signup');  // Sign up link
    });
  
    it('should show error message for empty email and password fields', () => {
      cy.get('button[type="submit"]').click();  // Submit without entering any data
      cy.get('input:invalid').should('have.length', 2);  // Email and password are required
    });
  
    it('should show error message for incorrect login credentials', () => {
      cy.get('input[type="email"]').type('invaliduser@example.com');  // Enter invalid email
      cy.get('input[type="password"]').type('invalidpassword');  // Enter invalid password
      cy.get('button[type="submit"]').click();  // Click Login button
  
      // Assuming an error message appears upon failure
      cy.get('.error-message') 
      .should('be.visible') // Check if the error message is visible
      .and('contain', 'An error occurred. Please try again.'); // Check the message content
    
    });
  
    it('should log in successfully with valid credentials', () => {

      cy.get('input[type="email"]').type('vincetester@outlook.com');  // Enter valid email
      cy.get('input[type="password"]').type('Testing_01');  // Enter valid password
      cy.get('button[type="submit"]').click();  // Click Login button

      // For testing purposes, CAPTCHA has been disabled and bypassed as Cypress does not support cases like this

      cy.get('#errorMessage').should('not.exist'); // Ensure error message is not displayed
      cy.url().should('include', 'http://localhost:3000/user/vincetester@outlook.com');  
    });
  
    it('should handle "Forgot your password?" link correctly', () => {
      cy.get('.forgot-link a').click();  // Click on Forgot Password link
      cy.url().should('include', '/forgot-password');  // Ensure the redirect works
    });
  
    it('should handle "Sign Up" link correctly', () => {
      cy.get('.signup-link a').click();  // Click on Sign Up link
      cy.url().should('include', '/signup');  // Ensure the redirect works
    });
  });
  
