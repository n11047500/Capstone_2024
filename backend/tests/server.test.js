const db = require('../database');
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { app, sendEmail } = require('../server');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');

// Mock the transporter
const transporter = {
  sendMail: jest.fn((mailOptions, callback) => {
    callback(null, { response: 'Email sent' });
  }),
};

// Mock the sendEmail function
jest.mock('../server', () => {
  const actualModule = jest.requireActual('../server'); // Import the actual module
  return {
    ...actualModule, // Spread the actual exports
    sendEmail: jest.fn(), // Mock sendEmail
  };
});

jest.mock('axios'); // Mock axios for reCAPTCHA verification
jest.mock('jsonwebtoken'); // Mock jwt for token verification
jest.mock('bcryptjs'); // Mock bcrypt for password hashing
jest.mock('nodemailer'); // Mock nodemailer for sending emails
jest.mock('stripe'); // Mock stripe for payment processing

// Mock multer's upload middleware
const uploadFile = {
  single: jest.fn(() => (req, res, next) => {
    req.file = { /* Mock file object */ }; // Simulate a file upload
    next();
  }),
};


// Mock the database module
jest.mock('../database.js', () => {
  const mockConnection = {
    query: jest.fn(), // Mock the query method
  };

  return {
    connect: jest.fn(), // Mock the connect function
    getConnection: jest.fn(() => mockConnection), // Mock the getConnection method
  };
});

// Mock the Stripe module
jest.mock('stripe', () => {
  const mockPaymentIntent = {
    id: 'secret_test', // Mocked payment intent ID
    status: 'succeeded',
  };

  return jest.fn(() => ({
    paymentIntents: {
      retrieve: jest.fn().mockResolvedValue(mockPaymentIntent), // Mock implementation for retrieve
      create: jest.fn(), // You can mock create if needed
    },
  }));
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


describe('Server Endpoints', () => {
  const mockConnection = db.getConnection(); // Get the mocked connection instance
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  // Test GET /
  it('should return server status', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Server is running.');
  });

  // Test GET /products
  describe('GET /products', () => {
    const mockResults = [
      { Product_ID: 1, Product_Name: 'Product A' },
      { Product_ID: 2, Product_Name: 'Product B' },
    ]; // Mocking sample products

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should fetch all products successfully', async () => {
      // Mock the implementation of the query method for fetching all products
      mockConnection.query.mockImplementation((query, callback) => {
        if (query.trim() === 'SELECT * FROM products') {
          callback(null, mockResults); // Call the callback with mock results
        } else {
          callback(new Error('Unknown query')); // Call the callback with an error for unknown queries
        }
      });

      const response = await request(app).get('/products');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResults);
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM products', expect.any(Function));
    });

    it('should fetch specific products by IDs', async () => {
      const mockResults = [
        { Product_ID: 1, Product_Name: 'Product A' },
        { Product_ID: 2, Product_Name: 'Product B' },
      ]; // Mocking sample products

      const ids = '1,2'; // Mocking query parameter IDs

      // Mock the implementation of the query method
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, mockResults);
      });

      const response = await request(app)
        .get(`/products?ids=${ids}`); // Sending IDs in query parameters

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResults);
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM products WHERE Product_ID IN'),
        ['1', '2'], // Mocked IDs passed as values
        expect.any(Function)
      );
    });
    it('should return 500 if there is a database error while fetching products by IDs', async () => {
      const mockError = new Error('Database error');
      const ids = '1,2'; // Mocking query parameter IDs

      // Mock the implementation of the query method to return an error
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(mockError);
      });

      const response = await request(app)
        .get(`/products?ids=${ids}`); // Sending IDs in query parameters

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  // Test GET /products/:id
  describe('GET /products/:id', () => {
    const mockConnection = db.getConnection(); // Use the mocked connection instance
    const productId = 1; // Mock product ID for testing
    const mockProduct = { Product_ID: productId, Product_Name: 'Product A' }; // Mock product data
    const mockReviewData = { average_rating: 4.5, review_count: 10 }; // Mock review data

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should fetch product details successfully with average rating and review count', async () => {
      // Mock product query
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM products')) {
          callback(null, [mockProduct]); // Return the mock product
        } else if (query.includes('AVG(rating)')) {
          callback(null, [mockReviewData]); // Return mock review data
        }
      });

      const response = await request(app).get(`/products/${productId}`); // Call the endpoint

      // Assertions
      expect(response.status).toBe(200); // Expect a 200 status
      expect(response.body).toEqual({
        ...mockProduct,
        averageRating: mockReviewData.average_rating,
        reviewCount: mockReviewData.review_count,
      }); // Check that the response matches expected data
    });

    it('should return 404 if the product does not exist', async () => {
      // Mock product query to return no results
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM products')) {
          callback(null, []); // Return no product found
        }
      });

      const response = await request(app).get(`/products/${productId}`); // Call the endpoint

      // Assertions
      expect(response.status).toBe(404); // Expect a 404 status
      expect(response.text).toBe('Product not found'); // Check for the correct error message
    });

    it('should return 500 if there is a database error while fetching the product', async () => {
      const mockError = new Error('Database error');

      // Mock product query to return an error
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM products')) {
          callback(mockError); // Simulate a database error
        }
      });

      const response = await request(app).get(`/products/${productId}`); // Call the endpoint

      // Assertions
      expect(response.status).toBe(500); // Expect a 500 status
      expect(response.text).toBe('Internal Server Error'); // Check for the correct error message
    });

    it('should return 500 if there is a database error while fetching reviews', async () => {
      // Mock product query to return a valid product
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM products')) {
          callback(null, [mockProduct]); // Return the mock product
        } else if (query.includes('AVG(rating)')) {
          callback(new Error('Database error')); // Simulate a database error for reviews
        }
      });

      const response = await request(app).get(`/products/${productId}`); // Call the endpoint

      // Assertions
      expect(response.status).toBe(500); // Expect a 500 status
      expect(response.text).toBe('Internal Server Error'); // Check for the correct error message
    });
  });

  // Test POST /register
  describe('POST /register', () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      mobileNumber: '1234567890',
      dateOfBirth: '1990-01-01',
      role: 'customer',
      captchaToken: 'valid-token',
    };

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should return an error if reCAPTCHA token is missing', async () => {
      const response = await request(app).post('/register').send({ ...userData, captchaToken: undefined });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('reCAPTCHA is required');
    });

    it('should return an error if reCAPTCHA verification fails', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: false, 'error-codes': ['invalid-input-response'] } });

      const response = await request(app).post('/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Captcha verification failed');
      expect(response.body.errorCodes).toEqual(['invalid-input-response']);
    });

    it('should return an error if there is a database error while checking existing user', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app).post('/register').send(userData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error creating user. Please try again.');
    });

    it('should return an error if the user already exists', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, [{ email: userData.email }]); // Simulate user already exists
      });

      const response = await request(app).post('/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists.');
    });

    it('should successfully register a new user', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM users WHERE email = ?')) {
          callback(null, []); // Simulate no existing user found
        } else if (query.includes('INSERT INTO users')) {
          callback(null, { insertId: 1 }); // Simulate successful insertion
        }
      });
      bcrypt.hash.mockImplementation((password, saltRounds, callback) => {
        callback(null, 'hashedPassword'); // Simulate successful password hashing
      });

      const response = await request(app).post('/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully.');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe(userData.role);
    });

    it('should return an error if there is an error hashing the password', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, []); // Simulate no existing user found
      });
      bcrypt.hash.mockImplementation((password, saltRounds, callback) => {
        callback(new Error('Hashing error')); // Simulate hashing error
      });

      const response = await request(app).post('/register').send(userData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error creating user. Please try again.');
    });

    it('should return an error if there is an error inserting the user into the database', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM users WHERE email = ?')) {
          callback(null, []); // Simulate no existing user found
        } else if (query.includes('INSERT INTO users')) {
          callback(new Error('Database insert error')); // Simulate insertion error
        }
      });
      bcrypt.hash.mockImplementation((password, saltRounds, callback) => {
        callback(null, 'hashedPassword'); // Simulate successful password hashing
      });

      const response = await request(app).post('/register').send(userData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error creating user. Please try again.');
    });
  });

  // Test POST /login
  describe('POST /login', () => {
    const userData = {
      email: 'john.doe@example.com',
      password: 'password123',
      captchaToken: 'valid-token',
    };

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should return an error if captcha token is missing', async () => {
      const response = await request(app).post('/login').send({ ...userData, captchaToken: undefined });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Captcha is required');
    });

    it('should return an error if reCAPTCHA verification fails', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: false, 'error-codes': ['invalid-input-response'] } });

      const response = await request(app).post('/login').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Captcha verification failed');
      expect(response.body.errorCodes).toEqual(['invalid-input-response']);
    });

    it('should return an error if there is a database error while fetching user', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      // Mocking a database error
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(new Error('Database error')); // Simulate a database error
      });

      const response = await request(app).post('/login').send(userData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('An error occurred. Please try again.');
    });

    it('should return an error if user is not found', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      // Simulating that no user is found in the database
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, []); // Simulate no user found
      });

      const response = await request(app).post('/login').send(userData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return an error if the password is incorrect', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      // Simulating that a user is found but the password does not match
      mockConnection.query.mockImplementation((query, params, callback) => {
        const mockUser = { email: userData.email, password: 'hashedPassword', role: 'customer' };
        callback(null, [mockUser]); // Simulate user found in DB
      });

      // Mocking bcrypt to return false for password comparison
      bcrypt.compare.mockImplementation((password, hashedPassword, callback) => {
        callback(null, false); // Simulate password mismatch
      });

      const response = await request(app).post('/login').send(userData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Incorrect password');
    });

    it('should successfully log in a user', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      // Simulating that a user is found in the database
      mockConnection.query.mockImplementation((query, params, callback) => {
        const mockUser = { email: userData.email, password: 'hashedPassword', role: 'customer' };
        callback(null, [mockUser]); // Simulate user found in DB
      });

      // Mocking bcrypt to return true for password comparison
      bcrypt.compare.mockImplementation((password, hashedPassword, callback) => {
        callback(null, true); // Simulate successful password match
      });

      const response = await request(app).post('/login').send(userData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe('customer');
    });

    it('should return an error if there is an error comparing passwords', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      mockConnection.query.mockImplementation((query, params, callback) => {
        const mockUser = { email: userData.email, password: 'hashedPassword', role: 'customer' };
        callback(null, [mockUser]); // Simulate user found in DB
      });

      // Simulating an error while comparing passwords
      bcrypt.compare.mockImplementation((password, hashedPassword, callback) => {
        callback(new Error('Comparison error')); // Simulate comparison error
      });

      const response = await request(app).post('/login').send(userData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('An error occurred. Please try again.');
    });
  });

  // Test GET /user/:email
  describe('GET /user/:email', () => {
    const testEmail = 'john.doe@example.com';

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should return user details and addresses successfully', async () => {
      // Mocking user data
      const mockUser = {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: testEmail,
        mobile_number: '1234567890',
        date_of_birth: '1990-01-01',
        role: 'customer',
      };

      // Mocking addresses data
      const mockAddresses = [
        { type: 'shipping', address: '123 Shipping St' },
        { type: 'billing', address: '456 Billing Ave' },
      ];

      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT user_id')) {
          callback(null, [mockUser]); // Simulate user found in DB
        } else if (query.includes('SELECT type, address')) {
          callback(null, mockAddresses); // Simulate addresses found in DB
        }
      });

      const response = await request(app).get(`/user/${testEmail}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUser,
        shippingAddress: '123 Shipping St',
        billingAddress: '456 Billing Ave',
      });
    });

    it('should return an error if the user is not found', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT user_id')) {
          callback(null, []); // Simulate no user found
        }
      });

      const response = await request(app).get(`/user/${testEmail}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return an error if there is a database error fetching the user', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT user_id')) {
          callback(new Error('Database error')); // Simulate a database error
        }
      });

      const response = await request(app).get(`/user/${testEmail}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('An error occurred. Please try again.');
    });

    it('should return an error if there is a database error fetching the addresses', async () => {
      const mockUser = {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: testEmail,
        mobile_number: '1234567890',
        date_of_birth: '1990-01-01',
        role: 'customer',
      };

      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT user_id')) {
          callback(null, [mockUser]); // Simulate user found in DB
        } else if (query.includes('SELECT type, address')) {
          callback(new Error('Database error fetching addresses')); // Simulate a database error
        }
      });

      const response = await request(app).get(`/user/${testEmail}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('An error occurred. Please try again.');
    });
  });

  // Test PUT /user/:email
  describe('PUT /user/:email', () => {
    const email = 'test@example.com';

    afterEach(() => {
      jest.clearAllMocks(); // Clear mock calls and instances after each test
    });

    it('should update user information and addresses successfully', async () => {
      // Mock database query responses
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('UPDATE users')) {
          return callback(null, { affectedRows: 1 }); // User update successful
        }
        if (query.includes('SELECT user_id')) {
          return callback(null, [{ user_id: 1 }]); // Return user ID
        }
        if (query.includes('SELECT address_id')) {
          return callback(null, []); // No existing address
        }
        if (query.includes('INSERT INTO addresses')) {
          return callback(null); // Address insert successful
        }
      });

      const response = await request(app)
        .put(`/user/${email}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '1234567890',
          dateOfBirth: '2000-01-01',
          shippingAddress: '123 Shipping St',
          billingAddress: '456 Billing Ave'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User information updated successfully.' });
    });

    it('should return 404 if user is not found', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('UPDATE users')) {
          return callback(null, { affectedRows: 0 }); // User not found
        }
      });

      const response = await request(app)
        .put(`/user/${email}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '1234567890',
          dateOfBirth: '2000-01-01',
          shippingAddress: '123 Shipping St',
          billingAddress: '456 Billing Ave'
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found.' });
    });

    it('should return 500 if error occurs during user update', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('UPDATE users')) {
          return callback(new Error('DB Error')); // Error during update
        }
      });

      const response = await request(app)
        .put(`/user/${email}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '1234567890',
          dateOfBirth: '2000-01-01',
          shippingAddress: '123 Shipping St',
          billingAddress: '456 Billing Ave'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update user information - User Update.' });
    });

    it('should return 500 if error occurs while fetching user ID', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('UPDATE users')) {
          return callback(null, { affectedRows: 1 }); // Update user successful
        }
        if (query.includes('SELECT user_id')) {
          return callback(new Error('DB Error')); // Error fetching user ID
        }
      });

      const response = await request(app)
        .put(`/user/${email}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '1234567890',
          dateOfBirth: '2000-01-01',
          shippingAddress: '123 Shipping St',
          billingAddress: '456 Billing Ave'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update user information - User ID Fetch.' });
    });

    it('should return 404 if user ID is not found', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (query.includes('UPDATE users')) {
          return callback(null, { affectedRows: 1 }); // Update user successful
        }
        if (query.includes('SELECT user_id')) {
          return callback(null, []); // User ID not found
        }
      });

      const response = await request(app)
        .put(`/user/${email}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '1234567890',
          dateOfBirth: '2000-01-01',
          shippingAddress: '123 Shipping St',
          billingAddress: '456 Billing Ave'
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User ID not found.' });
    });
  });

  // Test POST /forgot-password
  describe('POST /forgot-password', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 400 if email is not provided', async () => {
      const response = await request(app).post('/forgot-password').send({ captchaToken: 'dummyToken' });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Email is required' });
    });
  
    it('should return 400 if captchaToken is not provided', async () => {
      const response = await request(app).post('/forgot-password').send({ email: 'test@example.com' });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Captcha is required' });
    });
  
    it('should return 400 if captcha verification fails', async () => {
      axios.post.mockResolvedValueOnce({
        data: { success: false, 'error-codes': ['invalid-input-response'] },
      });
  
      const response = await request(app).post('/forgot-password').send({
        email: 'test@example.com',
        captchaToken: 'dummyToken',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Captcha verification failed',
        errorCodes: ['invalid-input-response'],
      });
    });
  
    it('should return 404 if email does not exist in the database', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
  
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []); // No user found
      });
  
      const response = await request(app).post('/forgot-password').send({
        email: 'nonexistent@example.com',
        captchaToken: 'dummyToken',
      });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found.' });
    });
  
    it('should return 500 if there is a database error', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
  
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });
  
      const response = await request(app).post('/forgot-password').send({
        email: 'test@example.com',
        captchaToken: 'dummyToken',
      });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'An error occurred. Please try again.' });
    });
  
    it('should send reset email and return 200 on success', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
  
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ email: 'test@example.com' }]); // User found
      });
  
      jwt.sign.mockReturnValue('testResetToken');
  
      transporter.sendMail.mockImplementationOnce((mailOptions, callback) => {
        callback(null, { response: 'Email sent' }); // Simulate successful email sending
      });
  
      const response = await request(app).post('/forgot-password').send({
        email: 'test@example.com',
        captchaToken: 'validToken',
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Password reset link sent to your email.' });
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: process.env.EMAIL_USER,
          to: 'test@example.com',
          subject: 'Password Reset Request',
        }),
        expect.any(Function)
      );
    });
  
    it('should return 500 if there is an error sending the email', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });
  
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ email: 'test@example.com' }]); // User found
      });
  
      jwt.sign.mockReturnValue('testResetToken');
  
      transporter.sendMail.mockImplementationOnce((mailOptions, callback) => {
        callback(new Error('Email service is down')); // Simulate email sending failure
      });
  
      const response = await request(app).post('/forgot-password').send({
        email: 'test@example.com',
        captchaToken: 'validToken',
      });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Error sending email.' });
    });
  });

  // Test POST /reset-password/:token
  describe('POST /reset-password/:token', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 400 if captchaToken is not provided', async () => {
      const response = await request(app).post('/reset-password/valid-token').send({
        newPassword: 'newPassword123',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Captcha is required' });
    });

    it('should return 400 if the token is invalid or expired', async () => {
      // Mocking JWT verification to throw an error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
  
      const response = await request(app).post('/reset-password/invalid-token').send({
        newPassword: 'newPassword123',
        captchaToken: 'valid-captcha',
      });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid or expired token.' });
    });
  
    it('should return 404 if the user is not found in the database', async () => {
      // Mock successful captcha verification
      axios.post.mockResolvedValue({ data: { success: true } });
  
      // Mock JWT verification to return a valid email
      jwt.verify.mockReturnValue({ email: 'test@example.com' });
  
      // Mock DB query for user, returning no user
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });
  
      const response = await request(app).post('/reset-password/valid-token').send({
        newPassword: 'newPassword123',
        captchaToken: 'valid-captcha',
      });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found.' });
    });
  
    it('should return 500 if there is an error hashing the password', async () => {
      // Mock successful captcha verification
      axios.post.mockResolvedValue({ data: { success: true } });
  
      // Mock JWT verification to return a valid email
      jwt.verify.mockReturnValue({ email: 'test@example.com' });
  
      // Mock DB query to return a user
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ email: 'test@example.com' }]);
      });
  
      // Mock bcrypt.hash to throw an error
      bcrypt.hash.mockImplementationOnce((password, saltRounds, callback) => {
        callback(new Error('Hashing error'), null);
      });
  
      const response = await request(app).post('/reset-password/valid-token').send({
        newPassword: 'newPassword123',
        captchaToken: 'valid-captcha',
      });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Error hashing password.' });
    });
  
    it('should return 500 if there is an error updating the password in the database', async () => {
      // Mock successful captcha verification
      axios.post.mockResolvedValue({ data: { success: true } });
  
      // Mock JWT verification to return a valid email
      jwt.verify.mockReturnValue({ email: 'test@example.com' });
  
      // Mock DB query to return a user
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ email: 'test@example.com' }]);
      });
  
      // Mock bcrypt.hash to return a hashed password
      bcrypt.hash.mockImplementationOnce((password, saltRounds, callback) => {
        callback(null, 'hashedPassword123');
      });
  
      // Mock the update query to throw an error
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('DB update error'), null);
      });
  
      const response = await request(app).post('/reset-password/valid-token').send({
        newPassword: 'newPassword123',
        captchaToken: 'valid-captcha',
      });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'An error occurred while updating the password.' });
    });
  
    it('should return 200 and reset the password successfully', async () => {
      // Mock successful captcha verification
      axios.post.mockResolvedValue({ data: { success: true } });
  
      // Mock JWT verification to return a valid email
      jwt.verify.mockReturnValue({ email: 'test@example.com' });
  
      // Mock DB query to return a user
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ email: 'test@example.com' }]);
      });
  
      // Mock bcrypt.hash to return a hashed password
      bcrypt.hash.mockImplementationOnce((password, saltRounds, callback) => {
        callback(null, 'hashedPassword123');
      });
  
      // Mock the update query to return success
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });
  
      const response = await request(app).post('/reset-password/valid-token').send({
        newPassword: 'newPassword123',
        captchaToken: 'valid-captcha',
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Password has been reset successfully.' });
    });
  });

  // Test POST /add-product
  describe('POST /add-product', () => {
    it('should successfully add a product with valid data', async () => {
      const mockResult = { insertId: 1 }; // Mocking a successful insert with an ID

      // Mock the implementation of the query method
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/add-product')
        .send({
          name: 'Test Product',
          price: 10.99,
          quantity: 100,
          description: 'A great product',
          dimensions: '10x10x10',
          options: null, // Can set as needed
          imageUrl: null, // Can set as needed
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Product added successfully', productId: 1 });
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.any(String),
        [
          'Test Product',
          10.99,
          100,
          'A great product',
          '10x10x10',
          null, // options
          null  // imageUrl
        ],
        expect.any(Function)
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/add-product')
        .send({
          price: 10.99,
          quantity: 100,
          description: 'A great product',
          dimensions: '10x10x10',
          options: null,
          imageUrl: null,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'All fields except options and image URL are required.' });
    });

    it('should return 500 if there is a database error', async () => {
      const mockError = new Error('Database error');

      // Mock the implementation of the query method to return an error
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(mockError);
      });

      const response = await request(app)
        .post('/add-product')
        .send({
          name: 'Test Product',
          price: 10.99,
          quantity: 100,
          description: 'A great product',
          dimensions: '10x10x10',
          options: null,
          imageUrl: null,
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'An error occurred while adding the product.' });
    });
  });

  // Test PUT /products/:id
  describe('PUT /products/:id', () => {
    it('should successfully update a product with valid data', async () => {
      const mockResult = { affectedRows: 1 }; // Mocking a successful update

      // Mock the implementation of the query method
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .put('/products/1') // Assuming you are updating product with ID 1
        .send({
          name: 'Updated Product',
          price: 12.99,
          quantity: 80,
          description: 'An updated great product',
          dimensions: '12x12x12',
          options: null, // Can set as needed
          imageUrl: null, // Can set as needed
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Product updated successfully.' });
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.any(String),
        [
          'Updated Product',
          12.99,
          80,
          'An updated great product',
          '12x12x12',
          null, // options
          null, // imageUrl
          '1' // productId
        ],
        expect.any(Function)
      );
    });

    it('should return 404 if the product is not found', async () => {
      const mockResult = { affectedRows: 0 }; // Mocking no affected rows (product not found)

      // Mock the implementation of the query method
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .put('/products/999') // Assuming ID 999 does not exist
        .send({
          name: 'Non-existent Product',
          price: 15.99,
          quantity: 50,
          description: 'This product does not exist.',
          dimensions: '5x5x5',
          options: null,
          imageUrl: null,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Product not found.' });
    });

    it('should return 500 if there is a database error', async () => {
      const mockError = new Error('Database error');

      // Mock the implementation of the query method to return an error
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(mockError);
      });

      const response = await request(app)
        .put('/products/1') // Assuming you are updating product with ID 1
        .send({
          name: 'Another Product',
          price: 20.99,
          quantity: 60,
          description: 'This product update will fail.',
          dimensions: '8x8x8',
          options: null,
          imageUrl: null,
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'An error occurred while updating the product.' });
    });
  });

  // Test DELETE /products/:id
  describe('DELETE /products/:id', () => {
    it('should successfully delete a product with a valid ID', async () => {
      const mockResult = { affectedRows: 1 }; // Mocking a successful deletion

      // Mock the implementation of the query method
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .delete('/products/1'); // Assuming you are deleting product with ID 1

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Product deleted successfully.' });
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.any(String),
        ['1'], // productId
        expect.any(Function)
      );
    });

    it('should return 404 if the product is not found', async () => {
      const mockResult = { affectedRows: 0 }; // Mocking no affected rows (product not found)

      // Mock the implementation of the query method
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .delete('/products/999'); // Assuming ID 999 does not exist

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Product not found.' });
    });

    it('should return 500 if there is a database error', async () => {
      const mockError = new Error('Database error');

      // Mock the implementation of the query method to return an error
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(mockError);
      });

      const response = await request(app)
        .delete('/products/1'); // Assuming you are deleting product with ID 1

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'An error occurred while deleting the product.' });
    });
  });

  // Test GET /orders/:id
  describe('GET /orders/:id', () => {
    afterEach(() => {
      jest.clearAllMocks(); // Clear mocks after each test
    });
  
    it('should return order details when order exists', async () => {
      const mockOrderId = 1;
      const mockOrder = {
        Order_ID: mockOrderId,
        Total_Amount: 100,
        Product_IDs: '101:optionA, 102:optionB',
        First_Name: 'John',
        Last_Name: 'Doe',
        Mobile: '1234567890',
        Email: 'john.doe@example.com',
        Street_Address: '123 Main St',
        Order_Type: 'Online',
        status: 'Completed',
        Order_Date: new Date().toISOString(),
      };
  
      const mockProducts = [
        { Product_ID: '101', Name: 'Product A', Price: 50 },
        { Product_ID: '102', Name: 'Product B', Price: 50 },
      ];
  
      // Mock the query response for the order
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [mockOrder]);
      });
  
      // Mock the query response for the products
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, mockProducts);
      });
  
      const response = await request(app).get(`/orders/${mockOrderId}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockOrder,
        products: [
          { Product_ID: '101', Name: 'Product A', Price: 50, option: 'optionA' },
          { Product_ID: '102', Name: 'Product B', Price: 50, option: 'optionB' },
        ],
      });
    });
  
    it('should return 404 if the order does not exist', async () => {
      const mockOrderId = 999;
  
      // Mock the query response to return no results
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });
  
      const response = await request(app).get(`/orders/${mockOrderId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Order not found' });
    });
  
    it('should return 500 if there is a database error', async () => {
      const mockOrderId = 1;
  
      // Mock the query to simulate a database error
      mockConnection.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'));
      });
  
      const response = await request(app).get(`/orders/${mockOrderId}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  // Test GET /orders
  describe('GET /orders', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return all orders when no status is provided', async () => {
      const mockOrders = [
        {
          Order_ID: 1,
          Total_Amount: 100,
          Product_IDs: '101:optionA, 102:optionB',
          First_Name: 'John',
          Last_Name: 'Doe',
          Mobile: '1234567890',
          Email: 'john.doe@example.com',
          Street_Address: '123 Main St',
          Order_Type: 'Online',
          status: 'Completed',
        },
        {
          Order_ID: 2,
          Total_Amount: 200,
          Product_IDs: '103:optionC',
          First_Name: 'Jane',
          Last_Name: 'Doe',
          Mobile: '0987654321',
          Email: 'jane.doe@example.com',
          Street_Address: '456 Elm St',
          Order_Type: 'In-Store',
          status: 'Pending',
        },
      ];
  
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, mockOrders);
      });
  
      const response = await request(app).get('/orders');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
      expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), expect.anything(), expect.any(Function));
    });
  
    it('should return filtered orders by status', async () => {
      const mockOrders = [
        {
          Order_ID: 1,
          Total_Amount: 100,
          Product_IDs: '101:optionA',
          First_Name: 'John',
          Last_Name: 'Doe',
          Mobile: '1234567890',
          Email: 'john.doe@example.com',
          Street_Address: '123 Main St',
          Order_Type: 'Online',
          status: 'Completed',
        },
      ];
  
      mockConnection.query.mockImplementation((query, params, callback) => {
        expect(params[0]).toBe('Completed'); // Ensure the correct parameter is passed
        callback(null, mockOrders);
      });
  
      const response = await request(app).get('/orders?status=Completed');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
      expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), ['Completed'], expect.any(Function));
    });
  
    it('should return 500 if there is a database error', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });
  
      const response = await request(app).get('/orders');
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  // Test PUT /orders/:id
  describe('PUT /orders/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 400 if status is not provided', async () => {
      const response = await request(app).put('/orders/1').send({});
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Status is required' });
    });
  
    it('should update order status successfully', async () => {
      const orderId = 1;
      const newStatus = 'Shipped';
  
      // Mocking the database update response
      mockConnection.query.mockImplementation((query, params, callback) => {
        expect(params[0]).toBe(newStatus); // Check that the correct new status is sent
        expect(params[1]).toBe(orderId.toString()); // Check that the correct order ID is sent
        callback(null, { affectedRows: 1 }); // Simulate successful update
      });
  
      const response = await request(app).put(`/orders/${orderId}`).send({ status: newStatus });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Order status updated successfully.' });
    });
  
    it('should return 404 if order does not exist', async () => {
      const orderId = 1;
      const newStatus = 'Shipped';
  
      // Mocking the database update response for a non-existent order
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 }); // Simulate no affected rows
      });
  
      const response = await request(app).put(`/orders/${orderId}`).send({ status: newStatus });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Order not found' });
    });
  
    it('should return 500 if there is a database error', async () => {
      const orderId = 1;
      const newStatus = 'Shipped';
  
      // Mocking a database error
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });
  
      const response = await request(app).put(`/orders/${orderId}`).send({ status: newStatus });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  // Test POST /send-email
  describe('POST /send-email', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    test('should send email successfully and return 200', async () => {
      nodemailer.createTransport.mockReturnValue(transporter);
  
      const response = await request(app).post('/send-email').send({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>This is a test email.</p>',
      });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Email sent successfully');
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@example.com',
          subject: 'Test Subject',
          html: '<p>This is a test email.</p>',
        }),
        expect.any(Function)
      );
    });
  
    test('should return 500 if sending email fails', async () => {
      const mockSendMail = jest.fn((mailOptions, callback) => {
        callback(new Error('Send mail error'));
      });
      
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      });
  
      const response = await request(app).post('/send-email').send({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>This is a test email.</p>',
      });
  
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('Failed to send email');
      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  // Test POST /send-contact-email
  describe('POST /send-contact-email', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    test('should return 400 if captchaToken is missing', async () => {
      const response = await request(app).post('/send-contact-email').send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        mobile: '1234567890',
        inquiry: 'Hello!',
      });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Captcha is required');
    });
  
    test('should return 400 if reCAPTCHA verification fails', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: false,
          'error-codes': ['invalid-input-response'],
        },
      });
  
      const response = await request(app).post('/send-contact-email').send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        mobile: '1234567890',
        inquiry: 'Hello!',
        captchaToken: 'dummy-token',
      });
  
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Captcha verification failed');
    });
  
    test('should return 500 if nodemailer fails', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
        },
      });
  
      const mockSendMail = jest.fn((options, callback) => callback(new Error('Send mail error')));
      nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });
  
      const response = await request(app).post('/send-contact-email').send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        mobile: '1234567890',
        inquiry: 'Hello!',
        captchaToken: 'dummy-token',
      });
  
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Error sending email');
    });
  
    test('should return 200 if email is sent successfully', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
        },
      });
  
      nodemailer.createTransport.mockReturnValue({
        sendMail: jest.fn((options, callback) => callback(null, { response: 'Email sent' })),
      });
  
      const response = await request(app).post('/send-contact-email').send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        mobile: '1234567890',
        inquiry: 'Hello!',
        captchaToken: 'dummy-token',
      });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Email sent successfully!');
    });
  });

  // Test POST /api/orders
  describe('POST /api/orders', () => {
    it('should process an order and return order details', async () => {
      // Mock Stripe payment intent creation
      jest.spyOn(stripe.paymentIntents, 'create').mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'client_secret',
        status: 'succeeded',
      });

      const response = await request(app)
        .post('/api/orders')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          phone: '0987654321',
          streetAddress: '123 Main St',
          orderType: 'Standard',
          productIds: ['1:12345', '2:67890'],
          totalAmount: 100.00,
          paymentMethodId: 'pm_test_123',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('client_secret');
      expect(response.body).toHaveProperty('products');
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/api/orders')
        .send({
          firstName: 'Jane',
          email: 'jane.doe@example.com',
          phone: '0987654321',
          // Missing required fields
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({ error: 'Missing required fields' });
    });
  });

  // Test GET /api/orders/details
  describe('GET /api/orders/details', () => {
    it('should return order details successfully', async () => {
      const mockOrderResponse = {
        Product_IDs: '1:2, 3:4',
      };
  
      // Mocking the database query to return an order
      jest.spyOn(mockConnection, 'query').mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM orders WHERE client_secret = ?')) {
          return callback(null, [mockOrderResponse]); // Simulating a successful order retrieval
        }
        callback(new Error('Query not recognized')); // Simulating an error for unrecognized queries
      });
  
      // Mocking product retrieval
      jest.spyOn(mockConnection, 'query').mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM products WHERE Product_ID IN')) {
          return callback(null, [
            { id: 1, name: 'Product 1' },
            { id: 2, name: 'Product 2' },
            { id: 3, name: 'Product 3' },
            { id: 4, name: 'Product 4' },
          ]); // Simulating successful product retrieval
        }
        callback(new Error('Query not recognized')); // Simulating an error for unrecognized queries
      });
  
      // Making a request to your endpoint
      const response = await request(app)
        .get('/api/orders/details')
        .query({ client_secret: 'secret_test' }); // Replace with your test case
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('order', mockOrderResponse);
      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toHaveLength(4); // Expecting 4 products based on mock data
    });
  
    it('should return 400 if client_secret is missing', async () => {
      const response = await request(app).get('/api/orders/details'); // No query params
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Client secret is required' });
    });
  
    it('should return 404 if payment not found or not successful', async () => {
      // Adjust the mock to simulate payment intent not found
      jest.clearAllMocks();
      jest.mock('stripe', () => {
        return jest.fn(() => ({
          paymentIntents: {
            retrieve: jest.fn().mockResolvedValue(null), // Simulate not found
          },
        }));
      });
  
      const response = await request(app)
        .get('/api/orders/details')
        .query({ client_secret: 'invalid_secret' });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Payment not found or not successful' });
    });
  
    it('should return 404 if order not found', async () => {
      jest.clearAllMocks();
      // Mock the payment intent as succeeded
      jest.mock('stripe', () => {
        const mockPaymentIntent = {
          id: 'secret_test',
          status: 'succeeded',
        };
  
        return jest.fn(() => ({
          paymentIntents: {
            retrieve: jest.fn().mockResolvedValue(mockPaymentIntent),
          },
        }));
      });
  
      // Mock the database query to return no orders
      jest.spyOn(mockConnection, 'query').mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM orders WHERE client_secret = ?')) {
          return callback(null, []); // Simulating no orders found
        }
        callback(new Error('Query not recognized')); // Simulating an error for unrecognized queries
      });
  
      const response = await request(app)
        .get('/api/orders/details')
        .query({ client_secret: 'pi_test_123_secret_test_secret' });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Order not found' });
    });
  });

  // Test POST /submit-form
  describe('POST /submit-form', () => {
    afterEach(() => {
      jest.clearAllMocks(); // Clear mock calls after each test
    });
  
    it('should submit the form and send an email successfully', async () => {
      // Arrange: Set up the mock implementation of sendEmail
      sendEmail.mockResolvedValueOnce(); // Resolve sendEmail promise
  
      const formData = {
        colorType: 'Solid',
        color: 'Red',
        customColor: 'Bright Red',
        width: '100',
        wicking: 'Yes',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        comment: 'No comments',
      };
  
      // Act: Send the POST request
      const response = await request(app)
        .post('/submit-form')
        .field('colorType', formData.colorType)
        .field('color', formData.color)
        .field('customColor', formData.customColor)
        .field('width', formData.width)
        .field('wicking', formData.wicking)
        .field('firstName', formData.firstName)
        .field('lastName', formData.lastName)
        .field('email', formData.email)
        .field('comment', formData.comment)
        .attach('file', Buffer.from('test file content'), 'test-file.txt'); // Attach a mock file
  
      // Assert: Check the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Form submitted and email sent successfully' });
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        colorType: formData.colorType,
        color: formData.color,
        customColor: formData.customColor,
        width: formData.width,
        wicking: formData.wicking,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        comment: formData.comment,
        file: expect.any(Object), // Expecting a file object
      }));
    });
  
    it('should return an error if no file is uploaded', async () => {
      // Arrange: Override the upload middleware to simulate no file uploaded
      uploadFile.single = jest.fn((fieldName) => (req, res, next) => {
        req.file = null; // Simulate no file uploaded
        next();
      });
  
      const formData = {
        colorType: 'Solid',
        color: 'Red',
        customColor: 'Bright Red',
        width: '100',
        wicking: 'Yes',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        comment: 'No comments',
      };
  
      // Act: Send the POST request without a file
      const response = await request(app)
        .post('/submit-form')
        .field('colorType', formData.colorType)
        .field('color', formData.color)
        .field('customColor', formData.customColor)
        .field('width', formData.width)
        .field('wicking', formData.wicking)
        .field('firstName', formData.firstName)
        .field('lastName', formData.lastName)
        .field('email', formData.email)
        .field('comment', formData.comment);
  
      // Assert: Check the response for no file error
      expect(response.status).toBe(400); // Expecting 400 Bad Request for missing file
      expect(response.body).toEqual({ message: 'No file uploaded' }); // Adjusted message for clarity
      expect(sendEmail).not.toHaveBeenCalled(); // Ensure sendEmail was not called
    });
  
    it('should handle errors during form submission', async () => {
      // Arrange: Mock sendEmail to throw an error
      sendEmail.mockRejectedValueOnce(new Error('Email sending failed'));
  
      const formData = {
        colorType: 'Solid',
        color: 'Red',
        customColor: 'Bright Red',
        width: '100',
        wicking: 'Yes',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        comment: 'No comments',
      };
  
      // Act: Send the POST request with a file
      const response = await request(app)
        .post('/submit-form')
        .field('colorType', formData.colorType)
        .field('color', formData.color)
        .field('customColor', formData.customColor)
        .field('width', formData.width)
        .field('wicking', formData.wicking)
        .field('firstName', formData.firstName)
        .field('lastName', formData.lastName)
        .field('email', formData.email)
        .field('comment', formData.comment)
        .attach('file', Buffer.from('test file content'), 'test-file.txt'); // Attach a mock file
  
      // Assert: Check the response for error handling
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Error in form submission' });
    });
  });

  // Test GET /api/search
  describe('GET /api/search', () => {
    // Mock the connection.query method
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 400 if query parameter is missing', async () => {
      const response = await request(app).get('/api/search');
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Query parameter is required' });
    });
  
    it('should return results when a valid query is provided', async () => {
      const mockResults = [
        { Product_Name: 'Test Product 1', Description: 'A sample product' },
        { Product_Name: 'Test Product 2', Description: 'Another sample product' },
      ];
  
      // Mock the database query
      mockConnection.query = jest.fn((sql, values, callback) => {
        callback(null, mockResults); // Simulate a successful database query
      });
  
      const response = await request(app).get('/api/search').query({ query: 'Test' });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResults);
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM products'),
        [`%Test%`, `%Test%`],
        expect.any(Function)
      );
    });
  
    it('should return 500 if there is a database error', async () => {
      // Mock the database query to simulate an error
      mockConnection.query = jest.fn((sql, values, callback) => {
        callback(new Error('Database query error'), null); // Simulate a database error
      });
  
      const response = await request(app).get('/api/search').query({ query: 'Test' });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  // Test GET /reviews/:id
  describe('GET /reviews/:id', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 404 if no reviews are found for the product', async () => {
      const productId = 1;
  
      // Mock the database query to return no reviews
      mockConnection.query = jest.fn((sql, values, callback) => {
        callback(null, []); // Simulate no reviews found
      });
  
      const response = await request(app).get(`/reviews/${productId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'No reviews found for this product' });
    });
  
    it('should return reviews, ratings, review count, and average rating when reviews are found', async () => {
      const productId = 1;
  
      // Mock the database queries
      const mockReviews = [
        { review_id: 1, product_id: productId, rating: 4, comment: 'Great product!', first_name: 'John' },
        { review_id: 2, product_id: productId, rating: 5, comment: 'Excellent!', first_name: 'Jane' },
      ];
      const mockRatings = [
        { rating: 4 },
        { rating: 5 },
      ];
      const mockCountResults = [{ review_count: 2 }];
      const mockAvgResults = [{ average_rating: 4.5 }];
  
      mockConnection.query = jest.fn((sql, values, callback) => {
        if (sql.includes('SELECT r.review_id')) {
          callback(null, mockReviews); // Return mock reviews
        } else if (sql.includes('SELECT rating')) {
          callback(null, mockRatings); // Return mock ratings
        } else if (sql.includes('SELECT COUNT')) {
          callback(null, mockCountResults); // Return mock count
        } else if (sql.includes('SELECT AVG')) {
          callback(null, mockAvgResults); // Return mock average
        }
      });
  
      const response = await request(app).get(`/reviews/${productId}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        reviews: mockReviews,
        ratings: [4, 5],
        reviewCount: 2,
        averageRating: 4.5,
      });
    });
  
    it('should return 500 if there is a database error', async () => {
      const productId = 1;
  
      // Mock the database query to simulate an error
      mockConnection.query = jest.fn((sql, values, callback) => {
        callback(new Error('Database error'), null); // Simulate a database error
      });
  
      const response = await request(app).get(`/reviews/${productId}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  // Test POST /reviews
  describe('POST /reviews', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 400 if any required field is missing', async () => {
      const response = await request(app)
        .post('/reviews')
        .send({ productId: 1, rating: 5 }); // Missing comment
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'All fields are required' });
    });
  
    it('should create a review and return 201', async () => {
      const newReview = {
        productId: 1,
        rating: 5,
        comment: 'Great product!',
      };
  
      // Mock the database query to simulate successful insertion
      mockConnection.query = jest.fn((query, params, callback) => {
        callback(null, { insertId: 1 }); // Simulate successful insert
      });
  
      const response = await request(app)
        .post('/reviews')
        .send(newReview);
  
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Review created successfully' });
    });
  
    it('should return 500 if there is a database error', async () => {
      const newReview = {
        productId: 1,
        rating: 5,
        comment: 'Great product!',
      };
  
      // Mock the database query to simulate a database error
      mockConnection.query = jest.fn((query, params, callback) => {
        callback(new Error('Database error'), null); // Simulate database error
      });
  
      const response = await request(app)
        .post('/reviews')
        .send(newReview);
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });
});
