Cypress.Commands.add('loginAsEmployee', () => {
  cy.visit('http://localhost:3000/login')
  cy.get('input[type="email"]').type('vincetester@outlook.com');  
  cy.get('input[type="password"]').type('Testing_01');  
  cy.get('button[type="submit"]').click();  

  cy.wait(5000);

  // Wait for redirection and verify the employee dashboard is loaded
  cy.url().should('include', 'http://localhost:3000/user/vincetester@outlook.com');
  cy.contains('Employee Dashboard').should('be.visible'); // Verify that the user is an employee
});



describe('Employee Dashboard', () => {
  // Test case: Check all fields in the Contact Us page are shown
  it('Access the Employee Dashboard', () => {
    // Visit the contactus page
    cy.visit('http://localhost:3000/login') 
    
    cy.get('input[type="email"]').type('vincetester@outlook.com');  
    cy.get('input[type="password"]').type('Testing_01');  
    cy.get('button[type="submit"]').click();  


  });
});


describe('Employee Dashboard Functionality - Add Product', () => {
  beforeEach(() => {
    // Using an existing account that has "employee" role
    cy.loginAsEmployee();
    cy.visit('http://localhost:3000/user/vincetester@outlook.com');
    cy.contains('Employee Dashboard').should('be.visible'); // Verify that the user is an employee
  });

  
  it('Add Product - With Valid Data', () => {

    // Click on the Add Product button 
    cy.contains('Add Product').click();

    cy.get('h2').contains('Add Product');  // Check if the header is displayed
    cy.get('input[name="name"]').type('Test Large Planter Box');  // Product name 
    cy.get('input[name="price"]').type('300');  // Product price
    cy.get('input[name="quantity"]').type('50');  // Product quantity
    cy.get('textarea[name="description"]').type('This is a test description.');  // Product description
    cy.get('input[name="width"]').type('100');  // Product width
    cy.get('input[name="depth"]').type('200');  // Product depth
    cy.get('input[name="height"]').type('120');  // Product height
    cy.get('input[name="options"]').type('Surfmist, Jasper, Bushland, Ironstone');  // Product options
    cy.get('input[name="imageUrl"]').type('https://example.com/image.jpg');  // Product price

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the product was added successfully
    cy.contains('Product added successfully');
  });

  it('Add Product - With Missing Data', () => {
    // Click on the Add Product button 
    cy.contains('Add Product').click();
  
    // Ensure the Add Product form is displayed
    cy.get('h2').contains('Add Product');  
  
    // Fill out the fields 
    cy.get('input[name="quantity"]').type('50');  // Product quantity
    cy.get('textarea[name="description"]').type('This is a test description.');  // Product description
    cy.get('input[name="width"]').type('100');  // Product width
    cy.get('input[name="depth"]').type('200');  // Product depth
    cy.get('input[name="height"]').type('120');  // Product height
    cy.get('input[name="options"]').type('Surfmist, Jasper, Bushland, Ironstone');  // Product options    
    cy.get('input[name="imageUrl"]').type('https://example.com/image.jpg');  // Image URL
  
    // Missing fields: Product Name and Price
  
    // Submit the form
    cy.get('button[type="submit"]').click();
  
    // Check for validation messages for the required fields
    cy.get('input[name="name"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });   

    cy.get('input[name="price"]').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });

    

 
  });
});


describe('Employee Dashboard Functionality - Edit Product', () => {
  beforeEach(() => {
    // Using an existing account that has "employee" role
    cy.loginAsEmployee();
    cy.visit('http://localhost:3000/user/vincetester@outlook.com');
    cy.contains('Employee Dashboard').should('be.visible'); // Verify that the user is an employee
  });

  
  it('Edit Product - With an Existing Product', () => {

    // Click on the "Edit Product" button 
    cy.contains('Edit Product').click();

    // Select a product from the dropdown list
    cy.get('#productSelect') 
    .select('Test Large Planter Box'); // Select the product by its name

    cy.get('h2').contains('Edit Product');  // Check if the header is displayed

    cy.wait(3000);

    // Modify the product details
    cy.get('input[name="product-name"]')
    .should('be.visible')
    .clear()
    .type('Updated Large Planter Box');

    console.log('input[name="product-name"]');

    cy.get('input[name="price"]').clear().type('75'); // Update product price
    cy.get('input[name="quantity"]').clear().type('40'); // Update product quantity
    cy.get('textarea[name="description"]').clear().type('Updated description for the product.'); // Update description
    cy.get('input[name="width"]').clear().type('120'); // Update width
    cy.get('input[name="depth"]').clear().type('220'); // Update depth
    cy.get('input[name="height"]').clear().type('100'); // Update height
    cy.get('input[name="options"]').clear().type('New options'); // Update options
    cy.get('input[name="imageUrl"]').clear().type('https://example.com/updated-image.jpg'); // Update image URL

    // Submit the form
    cy.get('button[type="submit"]').contains('Update Product').click();

    // Assert that the product was added successfully
    cy.contains('Product updated successfully');
  });
});


describe('Employee Dashboard Functionality - Remove Product', () => { //Test failed (Fix Later)
  beforeEach(() => {
    // Using an existing account that has "employee" role
    cy.loginAsEmployee();
    cy.visit('http://localhost:3000/user/vincetester@outlook.com');
    cy.contains('Employee Dashboard').should('be.visible'); // Verify that the user is an employee
  });

  it('Remove an Existing Product', () => {

    // Click on the "Remove Product" button 
    cy.contains('Remove Product').click();

    // Select a product from the dropdown list
    cy.get('#productRemoveSelect') 
    .select('Test Large Planter Box'); // Select the product by its name

    // Verify that the "Delete Product" button is displayed
    cy.get('.delete-product-button').should('be.visible');

    // Click the "Delete Product" button
    cy.get('.delete-product-button').click();

    // Assuming there's a confirmation dialog, handle the confirmation
    cy.on('window:confirm', (str) => {
      expect(str).to.eq('Are you sure you want to delete this product?'); 
      return true; // Simulate clicking "Yes" on the confirmation dialog
    });

    // Verify that a success message is displayed
    cy.contains('Product deleted successfully').should('be.visible');
  });
});



describe('Employee Dashboard Functionality - Grant Access to New User', () => { 
  beforeEach(() => {
    // Using an existing account that has "employee" role
    cy.loginAsEmployee();
    cy.visit('http://localhost:3000/user/vincetester@outlook.com');
    cy.contains('Employee Dashboard').should('be.visible'); // Verify that the user is an employee
  });

  it('Should give employee role to new user', () => {

    // Click on the "Grant Access to New User" button 
    cy.contains('Grant Access to New User').click();

    // Input a user's email to grant access to
    cy.get('input[name="email"]').type('test@example.com'); // New user's email inputted

    // Click "Grant Access" button
    cy.get('button[type="submit"]').click();



    // Verify that a success message is displayed
    cy.contains('Successfully updated test@example.com to employee role.').should('be.visible');
  });
});


describe('Employee Dashboard Functionality - Manage Orders', () => {
  beforeEach(() => {
    // Using an existing account that has "employee" role
    cy.loginAsEmployee();
    cy.visit('http://localhost:3000/user/vincetester@outlook.com');
    cy.contains('Employee Dashboard').should('be.visible'); // Verify that the user is an employee
  });

  it('Should mark a order as completed', () => {

    let initialCompletedOrdersCount;

    // Click on the "Manage Orders" button 
    cy.contains('Manage Orders').click();

    // Set to view 'Completed' orders 
    cy.get('.select-filter') .select('Completed'); // Select 'Completed' orders
    cy.get('table tbody tr').then((rows) => {
      // Count rows with 'Completed' status
      initialCompletedOrdersCount = 0;
      rows.each((index, row) => {
        if (Cypress.$(row).find('td').eq(3).text().trim() === 'Completed') {
          initialCompletedOrdersCount++;
        }
      });
    });    


    // Set to view 'Pending' orders 
    cy.get('.select-filter') 
      .select('Pending'); // Select 'Pending' orders

    // Click on a specific order's "View Details" button
    cy.contains('View Details').first().click(); 


    cy.contains('Order Type:').then(($orderType) => {
      const orderTypeText = $orderType.text();
    
      if (orderTypeText.includes('Delivery')) {
        // Handle the "Delivery" case
        cy.get('#carrier').select('StarTrack'); 
    
        // Click the "Mark as Completed" button
        cy.get('button').contains('Mark as Completed').click();
    
        // Handle the prompt for tracking number
        cy.window().then((win) => {
          cy.stub(win, 'prompt').returns('12345'); // Simulate entering a tracking number (or an empty string if blank)
        });
        cy.get('button').contains('OK').click(); // Confirm the prompt
    
      } else if (orderTypeText.includes('Click and Collect')) {
        // Handle the "Click and Collect" case
        cy.log('Handling Click and Collect');
    
        // Click the "Mark as Completed" button (no prompt expected for Click and Collect)
        cy.get('button').contains('Mark as Completed').click();
      } else {
        cy.log('Unknown order type, continuing...');
      }
    });
    

    cy.reload();

    // Click on the "Manage Orders" button 
    cy.contains('Manage Orders').click();

    // Set to view 'Pending' orders if not set to it
    cy.get('.select-filter') 
      .select('Completed'); // Select 'Pending' orders 

    // Verify that the status changes to "Completed"
    cy.contains('Completed').should('be.visible');
  });

}); 
