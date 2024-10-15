describe('Contact Us - Page Load', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // Modify this with your actual URL or route
  });

  // Test case: Check all fields in the Contact Us page are shown
  it('Should navigate to the contact us page', () => {
    // Visit the contactus page
    cy.visit('http://localhost:3000/contactus') 
    
    cy.get('form').should('be.visible');
    cy.get('input[name="first_name"]').should('be.visible');
    cy.get('input[name="last_name"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="mobile"]').should('be.visible');
    cy.get('textarea[name="inquiry"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
});

describe('Contact Us Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/contactus'); // Modify this with your actual URL or route
  });

  // Test case: Submit a form with valid fields
  it('Form Submission - All fields inputted', () => {
    // Input details in the text fields 
    cy.get('input[name="first_name"]').type('John');
    cy.get('input[name="last_name"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('textarea[name="inquiry"]').type('This is a test message.');

    // Submitting the form with all required fields
    cy.get('button[type="submit"]').click();

    cy.wait(4000);
    
    // Checks that a confirmation message has been shown after submitting form
    cy.get('.response-message').should('contain', 'Your inquiry has been sent successfully!');
  });

  it('Form Submission - Missing fields required', () => {

    cy.get('button[type="submit"]').click();
    
    // Assert validation errors are shown
    cy.get('input[name="first_name"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });
    
    cy.get('input[name="last_name"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });
    
    cy.get('input[name="email"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });

    cy.get('textarea[name="inquiry"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });
  });

});