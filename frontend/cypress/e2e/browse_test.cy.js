describe('Browse Page Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/browse'); // Modify this with your actual URL or route
  });

  // Test if Search Functionality works as expected
  it('Should give search results', () => {
      
    // Click on a specific product to go to its detail page
    cy.get('input[type="text"]').type('standard');
    cy.get('.search-icon').click();
      
    cy.get('.product-card').should('have.length.greaterThan', 0)

    const TOTAL_PRODUCTS = 4;

    cy.get('.product-card')
      .should('have.length', TOTAL_PRODUCTS);
      
  });

  // Helper function to check if array is sorted
  const isSorted = (array, ascending = true) => {
    const sortedArray = [...array].sort((a, b) => ascending ? b - a : a - b); // Changed for High to Low
    console.log('Original:', array);
    console.log('Sorted Expected:', sortedArray);
    return Cypress._.isEqual(array, sortedArray);
  };
  

  it('should correctly sort products by different options', () => {

    // Test 1: Sort by Price (Low to High)
    cy.get('.browse-sort-dropdown').select('Price: Low to High');
    cy.wait(500); // wait for sorting to finish
    
    let previousPrice = 0;

    // Iterate through each product price and compare it with the previous one
    cy.get('.product-price').each(($el, index, $list) => {
      const currentPrice = parseFloat($el.text().replace(/[$,]/g, ''));
      
      // Skip comparison for the first element
      if (index > 0) {
        expect(currentPrice).to.be.gte(previousPrice); // Ensure current price is >= previous price
      }
      
      previousPrice = currentPrice; // Update the previous price
    });

    // Test 2: Sort by Price (High to Low)
    cy.get('.browse-sort-dropdown').select('Price: High to Low');
    cy.wait(500);
    
    previousPrice = Infinity;

    // Iterate through each product price and compare it with the previous one
    cy.get('.product-price').each(($el, index, $list) => {
      const currentPrice = parseFloat($el.text().replace(/[$,]/g, ''));
      
      // Skip comparison for the first element
      if (index > 0) {
        expect(currentPrice).to.be.lte(previousPrice); // Ensure current price is <= previous price
      }
      
      previousPrice = currentPrice; // Update the previous price
    });


    // Test 3: Sort by Name (A to Z)
    cy.get('.browse-sort-dropdown').select('Name: A-Z');
    cy.wait(500);

    let previousName = ''; // Initialize previousName with an empty string

    // Iterate through each product name and compare it with the previous one
    cy.get('.product-title').each(($el, index, $list) => {
      const currentName = $el.text().trim(); // Get the current product name
  
      // Skip comparison for the first element
      if (index > 0) {
        expect(currentName.localeCompare(previousName)).to.be.gte(0); // Ensure alphabetical order (A to Z)
      }
  
      previousName = currentName; // Update the previous name
    });

    // Test 4: Sort by Name (Z to A)
    cy.get('.browse-sort-dropdown').select('Name: Z-A');
    cy.wait(500);

    previousName = 'ZZZZ'; // Initialize previousName with a very high alphabetical value

    // Iterate through each product name and compare it with the previous one
    cy.get('.product-title').each(($el, index, $list) => {
      const currentName = $el.text().trim(); // Get the current product name
  
      // Skip comparison for the first element
      if (index > 0) {
        expect(currentName.localeCompare(previousName)).to.be.lte(0); // Ensure reverse alphabetical order (Z to A)
      }
  
      previousName = currentName; // Update the previous name
    });
  });

  // Test if Search Functionality works as expected
  it('Should give search results and sort by Price (High to Low)', () => {
  
    // Step 1: Perform the search for 'wicking'
    cy.get('input[type="text"]').type('wicking');
    cy.get('.search-icon').click();
    
    // Step 2: Ensure there are results and validate the total number of products found
    cy.get('.product-card').should('have.length.greaterThan', 0); // Make sure search has results
  
    const TOTAL_PRODUCTS = 4; // Change this to the correct number if needed
    cy.get('.product-card').should('have.length', TOTAL_PRODUCTS); // Validate the exact number of products
    
    // Step 3: Apply the sorting (High to Low)
    cy.get('.browse-sort-dropdown').select('Price: High to Low');
    
    cy.wait(500); // Ensure the page has time to refresh and sort
  
    // Step 4: Validate the products are sorted by price from High to Low
    let previousPrice = Infinity; // Start with a high number
  
    cy.get('.product-price').each(($el, index) => {
      const currentPrice = parseFloat($el.text().replace(/[$,]/g, '')); // Parse the price text to a float
  
      if (index > 0) {
        expect(currentPrice).to.be.lte(previousPrice); // Validate the current price is less than or equal to the previous one
      }
  
      previousPrice = currentPrice; // Update the previous price for the next comparison
    });
  
  });
  
});




