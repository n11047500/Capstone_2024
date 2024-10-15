describe('Review Page Load Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); 
  });

  // Test if the review page loads successfully after navigating through product
  it('Should navigate to the review page successfully after clicking on a product', () => {
    // Visit the products page (or homepage)
    cy.visit('http://localhost:3000/browse') 
    
    // Click on a specific product to go to its detail page
    cy.get('.product-card').first().click() 
    
    // Ensure the product page is loaded by checking the URL
    cy.url('http://localhost:3000/product/1').should('include', '/product/1') 
    cy.contains(`reviews`).click() // Click the review link from the Products page


    // Ensure the review page is loaded
    cy.url().should('include', 'http://localhost:3000/reviews/1') 
    cy.get('h1').should('contain', 'Reviews') // Check for the review page header
  })
})


describe('Review Page Functionality', () => {
  let initialReviewCount;

  beforeEach(() => {
    cy.visit('http://localhost:3000/reviews/1)'); 

    cy.get('.user-comments', { timeout: 10000 }).should('be.visible');

    cy.get('.user-comments').its('length').then((count) => {
      initialReviewCount = count;
    });
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.reload(); 
  });

  it('should load and display reviews', () => {

    cy.get('.user-comments').should('have.length', initialReviewCount); // Target only the li elements inside .user-comments

  });

  
  it('submit a new review', () => {
    cy.visit('http://localhost:3000/browse') 
    cy.get('.product-card').first().click() 
    cy.url('http://localhost:3000/product/1').should('include', '/product/1') 
    cy.contains(`reviews`).click() 

    // Ensure star rating inputs are visible and scroll them into view if needed
    cy.get('input[name="rating"][value="4"]')
      .scrollIntoView() // Scroll the element into view
      .should('exist') // Ensure the element is visible
      .check({ force: true }); // Force the check if the element is not interactable

    cy.get('textarea.comment-text').type('This is a great product for me to have!'); // Type the comment
    
    // Debug the current state
    cy.debug(); // Pause here to inspect

    // Submit the form
    cy.get('button.submit-review').click({ force: true });

    cy.reload();

    cy.wait(1000);

    // Function to click the "Next" button until it is disabled (last page reached)
    const clickNextUntilDisabled = () => {
      cy.get('.pagination-controls button').contains('Next') // Target the "Next" button
        .then(($nextBtn) => {
          if (!$nextBtn.is(':disabled')) { // If the "Next" button is not disabled
            cy.wrap($nextBtn).click(); // Click the "Next" button
            cy.wait(500); 
            clickNextUntilDisabled(); // Recursively call this function until "Next" is disabled
          }
        });
    };

    // Navigate to the last page by clicking "Next" until it's disabled
    clickNextUntilDisabled(); 

    // Verify that the new review appears on the page
    cy.contains('This is a great product for me to have!').should('exist'); // Check for the comment

  });
  

  it('submit a new review with missing rating/comment field', () => {
    cy.visit('http://localhost:3000/browse');
    cy.get('.product-card').first().click();
    cy.url().should('include', '/product/1');
    cy.contains('reviews').click();
  
    // Type only the comment
    cy.get('textarea.comment-text').type('This is a great product!');
    // Do not select a rating
    cy.get('button.submit-review').click();
    // Check if the error message is visible and contains the correct text
    cy.get('.error') 
      .should('be.visible') 
      .and('contain', 'Both rating and comment are required'); // Check if the error message contains the correct text
  });
  

  
  it('submit a new review with inappropriate words', () => {
    cy.visit('http://localhost:3000/browse') 
    cy.get('.product-card').first().click() 
    cy.url('http://localhost:3000/product/1').should('include', '/product/1') 
    cy.contains(`reviews`).click() 

    // Ensure star rating inputs are visible and scroll them into view if needed
    cy.get('input[name="rating"][value="1"]')
      .scrollIntoView() // Scroll the element into view
      .should('exist') // Ensure the element is visible
      .check({ force: true }); // Force the check if the element is not interactable
  
    cy.get('textarea.comment-text').type('This is shit.'); // Type the comment
    cy.get('button.submit-review').click();
    cy.get('.error') 
      .should('be.visible') // Ensure the error message is visible
      .and('contain', 'Your comment contains inappropriate language. Please revise it.'); // Check if the error message contains the correct text
  });
})