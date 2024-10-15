describe('Customised Order Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); 
    cy.get('.menu-icon').click();       // Click the Menu icon
    cy.get('.sidebar-nav').contains('Custom Planter Box').click();    
    cy.url('http://localhost:3000/customise').should('include', '/customise');  
  });


  // Test if Customised Order form submission with valid fields
  it('Customised Order Form with valid fields', () => {
    
    // Custom Options
    cy.contains('Standard Ezee Colours').click();
    cy.get('.dropdown-selected').click(); 

    // Verify that the dropdown options are visible
    cy.get('.dropdown-options').should('be.visible');

    cy.contains('.dropdown-options', 'Satin Black').click(); // Selects "Satin Black"
    cy.get('input[name="width"]').type(200); // Input width
    cy.contains('Yes').click();
    cy.contains('button', 'Next').click();
    cy.contains('button', 'Back').click();
    cy.contains('button', 'Next').click();

 
    // Personal Information
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('0424242424');
    cy.contains('button', 'Next').click();    

    // Additional Information
    cy.get('textarea[name="comment"]').type('This is a test message.');
    cy.contains('button', 'Submit Form').click();   

    cy.wait(5000);

    cy.url().should('include', 'http://localhost:3000/confirmation');
  });


  // Test if Customised Order form submission with valid fields and file attached
  it('Customised Order Form with valid fields and file attached', () => {
    
    // Mock the file upload
    const fileName = 'test-image.jpg'; // Name of your fixture file
    const fileType = 'image/jpg'; // MIME type of the file

    // Intercept the API request that handles the file upload
    cy.intercept('POST', '/api/upload', (req) => {
      req.reply((res) => {
        // Simulate a successful response
        res.send(200, {
          success: true,
          message: 'File uploaded successfully',
        });
      });
    }).as('fileUpload');

    // Custom Options
    cy.contains('Custom Colours').click();
    cy.get('input[name="customColor"]').type('Sandpaper'); 
    cy.get('input[name="width"]').type(120); // Input width
    cy.contains('No').click();
    cy.contains('button', 'Next').click();
 
    // Personal Information
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('0424242424');
    cy.contains('button', 'Next').click();    

    // Additional Information
    cy.get('textarea[name="comment"]').type('This is a test message.');
    cy.get('input[type="file"]').attachFile(fileName); // File upload
    cy.contains('button', 'Submit Form').click();  

    cy.wait(5000);

    cy.url().should('include', 'http://localhost:3000/confirmation');
  });

  // Test if Customised Order form submission with missing fields 
  it('Customised Order Form with missing comment', () => {

    // Custom Options
    cy.contains('Custom Colours').click();
    cy.get('input[name="customColor"]').type('Sandpaper'); 
    cy.get('input[name="width"]').type(120); // Input width
    cy.contains('No').click();
    cy.contains('button', 'Next').click();    
 
    
    // Personal Information
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('0424242424');
    cy.contains('button', 'Next').click();    

    // Additional Information
    cy.contains('button', 'Submit Form').click();   

    cy.get('textarea.comment-text').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });
  });
    
})

describe('Custom Options Validation Check ', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/customise')
    cy.wait(500);
  });

  it('Should alert check for color type', () => {
    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Please select a color type (Standard or Custom).');  // Check alert message
    });    
  });

  it('Should alert check for color', () => {
    cy.contains('Standard Ezee Colours').click();
    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Please select a color.');          // Check alert message
    });  
  });

  it('Should alert check for custom color', () => {
    cy.contains('Custom Colours').click();
    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Please enter a custom color.');    // Check alert message
    });    
  });
  
  it('Should alert check for width', () => {
    cy.contains('Standard Ezee Colours').click();
    cy.get('.dropdown-selected').click(); 
    cy.get('.dropdown-options').should('be.visible');
    cy.contains('.dropdown-options', 'Domain').click();   

    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Width must be greater than 0.');   // Check alert message
    });       
  });


  it('Should alert check for wicking', () => {
    cy.contains('Standard Ezee Colours').click();
    cy.get('.dropdown-selected').click(); 
    cy.get('.dropdown-options').should('be.visible');
    cy.contains('.dropdown-options', 'Domain').click();
    cy.get('input[name="width"]').type(150); 

    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Please select whether you want wicking.');   // Check alert message
    });     
  });
})

describe('Personal Information Validation Check', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/customise')
    cy.contains('Standard Ezee Colours').click();
    cy.get('.dropdown-selected').click(); 
    cy.get('.dropdown-options').should('be.visible');
    cy.contains('.dropdown-options', 'Domain').click();
    cy.get('input[name="width"]').type(150); 
    cy.contains('No').click();
    cy.contains('button', 'Next').click();
    cy.wait(500);
  });

  it('Should alert check for first name', () => {
    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('First Name is required');            // Check alert message
    });    
  });

  it('Should alert check for last name', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Last Name is required');             // Check alert message
    });  
  });

  it('Should alert check for email', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');

    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Email is required');                 // Check alert message
    });    
  });

  it('Should alert check for invalid email', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');

    cy.get('input[name="email"]').type('johndoe');
    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Email is invalid');                  // Check alert message
    });    
  });
  
  it('Should alert check for phone number', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com'); 

    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Phone number is required');          // Check alert message
    });       
  });

  it('Should alert check for invalid phone number', () => {
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="phone"]').type('test'); 

    cy.contains('button', 'Next').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Phone number is invalid');         // Check alert message
    });       
  });
})