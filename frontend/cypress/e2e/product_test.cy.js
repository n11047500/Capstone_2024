// Custom Cypress command to access the Stripe iframe
Cypress.Commands.add('getIframeBody', () => {
  return cy
    .get('iframe') // Adjust this selector to target the correct iframe
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
});



describe('Purchasing a product/s', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/browse'); // Modify this with your actual URL or route
  });


  // Test buying a product, stopping at inputting user info in the checkout page
  it('Purchasing a product/s before going through the checkout process', () => {
    
    cy.visit('http://localhost:3000/browse');
    cy.get('.product-card').eq(1).click();
    cy.url().should('include', '/product/2');
    cy.get('.product-options').select('Surfmist');
    cy.get('input[name="quantity"]').clear().type('2');

    // Add the product to the cart
    cy.get('.add-to-cart').click(); 

    // Go back to the products page
    cy.visit('http://localhost:3000/browse');

    // Click on the 5th product to go to its detail page
    cy.get('.product-card').eq(4).click();
    cy.url().should('include', '/product/5');
    cy.get('.product-options').select('Basalt');
    cy.get('input[name="quantity"]').clear().type('3');

    // Add the product to the cart
    cy.get('.add-to-cart').click(); 

    // Proceed to cart
    cy.get('.cart-icon').click(); 

  });


  // Test Checkout process
  it('Checkout Functionality', () => {
    // Visit the products page
    cy.visit('http://localhost:3000/browse');
  
    cy.get('.product-card').first().click();
    cy.url().should('include', '/product/1');
    cy.get('.product-options').select('Domain');
    cy.get('input[name="quantity"]').clear().type('2');
    cy.get('.add-to-cart').click();
  
    // Proceed to cart
    cy.get('.cart-icon').click();
    cy.get('.checkout-button').click();
  
    cy.intercept('POST', '/create-payment-intent', {
      statusCode: 200,
      body: { clientSecret: 'mocked-client-secret' },
    }).as('createPaymentIntent');

    // Input Personal Information
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('0424242424');
    cy.get('input[name="address"]').type('55 Barbour Rd, Bracken Ridge');
    cy.contains('button', 'Continue to Shipping').clic();k
  
    // Shipping Method
    cy.get('img[alt="Delivery"]').click();
    cy.contains('button', 'Next').click();
  
    cy.intercept('POST', '/complete-payment', {
      statusCode: 200,
      body: { success: true },  // Simulate a successful payment
    }).as('completePayment'); // Register alias for this as well

    cy.contains('button', 'Pay').click();    
    
    // Assert mocked Stripe responses
    cy.wait('@createPaymentIntent').then((interception) => {
      expect(interception.response.body.clientSecret).to.eq('mocked-client-secret');
    });


    cy.wait('@completePayment').then((interception) => {
      expect(interception.response.body.success).to.be.true;
    });
  
    // Verify redirection to order confirmation page
    cy.url().should('include', '/order-confirmation');
  });
})


describe('Product Page Validation Check', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/browse'); // Modify this with your actual URL or route
    cy.get('.product-card').first().click();
    cy.url().should('include', '/product/1');
  });


  // Test if a alert appears for product options
  it('Should alert check for product options', () => {
    cy.get('.add-to-cart').click(); 
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Please select an option');         // Check alert message
    });    
  });

  // Test if a alert appears for quantity
  it('Should alert check for quantity', () => {
    cy.get('.product-options').select('Domain');
    cy.get('input[name="quantity"]').clear().type('0');
    cy.get('.add-to-cart').click(); 
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Quantity must be at least 1');     // Check alert message
    });    
  });  
})


describe('Personal Information Validation Check', () => {
  beforeEach(() => {
    // Purchasing a product
    cy.visit('http://localhost:3000/browse');
    cy.get('.product-card').first().click();
    cy.url().should('include', '/product/1');
    cy.get('.product-options').select('Surfmist');
    cy.get('input[name="quantity"]').clear().type('2');     // Check alert message
    cy.get('.add-to-cart').click();
  
    // Proceed to cart
    cy.get('.cart-icon').click();
    cy.get('.checkout-button').click();

    cy.wait(500);
  });

  it('Should alert check for first name', () => {
    cy.contains('button', 'Continue to Shipping').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('First Name is required');          // Check alert message
    });    
  });

  it('Should alert check for last name', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.contains('button', 'Continue to Shipping').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Last Name is required');           // Check alert message
    });  
  });

  it('Should alert check for email', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');

    cy.contains('button', 'Continue to Shipping').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Email is required');               // Check alert message
    });    
  });

  it('Should alert check for invalid email', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');

    cy.get('input[name="email"]').type('johndoe');
    cy.contains('button', 'Continue to Shipping').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Email is invalid');                // Check alert message
    });    
  });
  
  it('Should alert check for phone number', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com'); 

    cy.contains('button', 'Continue to Shipping').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Phone number is required');        // Check alert message
    });       
  });

  it('Should alert check for invalid phone number', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('test'); 

    cy.contains('button', 'Continue to Shipping').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Phone number is invalid');         // Check alert message
    });       
  });

  it('Should alert check for address', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('0424242424');

    cy.contains('button', 'Continue to Shipping').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Address is required');             // Check alert message
    });       
  });  

  it('Should alert check for shipping', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('0424242424');
    cy.get('input[name="address"]').type('123 wall street');
    cy.contains('button', 'Continue to Shipping').click();

    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Please select a shipping option before proceeding.');  // Check alert message
    });       
  }); 

  it('Should alert check for payment', () => {
    // Stub `console.error` to monitor it
    const consoleErrorStub = cy.stub(console, 'error');

    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('0424242424');
    cy.get('input[name="address"]').type('123 wall street');
    cy.contains('button', 'Continue to Shipping').click();    
    cy.get('img[alt="Click and Collect"]').click();
    cy.contains('button', 'Next').click();

    cy.contains('button', 'Pay').click();    

    // Now, assert that `console.error` was called with the correct error message
    //cy.wrap(consoleErrorStub).should('be.calledWith', 'Payment failed:');
  }); 
})
