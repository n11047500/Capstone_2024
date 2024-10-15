describe('Home Page - Sidebar Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // Modify this with your actual URL or route
  });

   // Test if all products are displayed on website
   it('Should check all sidebar links functions correctly', () => {
      
    // Browse
    cy.get('.menu-icon').click();
    cy.get('.sidebar-nav').contains('Browse').click();
    cy.url('http://localhost:3000/browse').should('include', '/browse');

    // Custom Planter Box
    cy.get('.menu-icon').click();
    cy.get('.sidebar-nav').contains('Custom Planter Box').click();
    cy.url('http://localhost:3000/customise').should('include', '/customise'); 
    
    // About Us
    cy.get('.menu-icon').click();
    cy.get('.sidebar-nav').contains('About Us').click();
    cy.url('http://localhost:3000/aboutus').should('include', '/aboutus');    

    // Gallery
    cy.get('.menu-icon').click();
    cy.get('.sidebar-nav').contains('Gallery').click();
    cy.url('http://localhost:3000/gallery').should('include', '/gallery');

    // Contact Us
    cy.get('.menu-icon').click();
    cy.get('.sidebar-nav').contains('Contact Us').click();
    cy.url('http://localhost:3000/contactus').should('include', '/contactus');

    // Home
    cy.get('.menu-icon').click();
    cy.get('.sidebar-nav').contains('Home').click();
    cy.url('http://localhost:3000');

  });
});



describe('Home Page - Slideshow Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // Modify this with your actual URL or route
  });

  it('should display the first slide initially', () => {
    // Check that the first slide is active
    cy.get('.slide').first().should('have.class', 'active');
  });

  it('should rotate to the next slide after the interval', () => {
    // Wait for the interval (12 seconds) to pass and check the second slide
    cy.wait(12000); 
    cy.get('.slide').eq(1).should('have.class', 'active'); // The second slide should appear
  });

  it('should loop back to the first slide after all slides have been shown', () => {
    // Calculate total time to show all slides
    const numberOfSlides = 2; 
    const intervalTime = 12000; // Interval time in milliseconds
    const totalTime = numberOfSlides * intervalTime;

    // Wait for the slideshow to cycle through all slides
    cy.wait(totalTime);

    // Check that the slideshow has looped back to the first slide
    cy.get('.slide').first().should('have.class', 'active');
  });

  it('should display only one active slide at a time', () => {
    // Check that only one slide has the "active" class
    cy.get('.slide.active').should('have.length', 1);
  });

  it('should be able to click the arrows on slideshow and click button-link', () => {
    // Right Arrow
    cy.get('button.next').click();
    cy.get('.slide').eq(1).should('have.class', 'active');
    cy.get('button.next').click();
    cy.get('.slide').first().should('have.class', 'active');

    cy.wait(1000);

    // Left Arrow
    cy.get('button.prev').click();
    cy.get('.slide').eq(1).should('have.class', 'active');
    cy.get('button.prev').click();
    cy.get('.slide').first().should('have.class', 'active');

    cy.wait(1000);

    // Button-link
    cy.get('button.next').click();
    cy.get('.order-button').contains('Order Customised Planter Box').click();
    cy.url('http://localhost:3000/customise').should('include', '/customise'); 

  });
});


