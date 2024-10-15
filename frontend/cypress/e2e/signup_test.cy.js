describe('Signup Page', () => {

  beforeEach(() => {
    // Visit the signup page
    cy.visit('http://localhost:3000');
    cy.get('img[alt="User Icon"]').click();
    cy.contains('Sign Up').click();
  });

  // Tests if user is able to create an account
  it('should successfully submit the signup form', () => {
    cy.get('input[name="firstName"]').type('Jess');             // Input first name
    cy.get('input[name="lastName"]').type('Jest');              // Input last name
    cy.get('input[name="email"]').type('jess@example.com');     // Input email
    cy.get('input[name="password"]').type('Password1234!');     // Input password
    cy.get('input[name="mobileNumber"]').type('1234567890');    // Input mobile number
    cy.get('input[type="date"]').type('1990-01-01');            // Input date of birth
    
    // For testing purposes, CAPTCHA has been disabled and bypassed as Cypress does not support cases like this

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the form was submitted successfully by logging in
    cy.url().should('include', 'http://localhost:3000/login');
    cy.get('input[type="email"]').type('jess@example.com');  
    cy.get('input[type="password"]').type('Password1234!');  
    cy.get('button[type="submit"]').click(); 
    cy.url().should('include', 'http://localhost:3000/user/jess@example.com');



  });

  // Tests if validation errors appear for required fields
  it('should show validation errors for required fields', () => {
    cy.get('button[type="submit"]').click();

    // Assert validation errors are shown
    cy.get('input[name="firstName"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });

    cy.get('input[name="lastName"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });

    cy.get('input[name="email"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });

    cy.get('input[name="password"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });
  });

});
