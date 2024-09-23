const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = require('../server');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database'); 

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

describe('Server Endpoints', () => {
  beforeAll(async () => {
    // Optional: Initialize your test database or mock data here
  });

  afterAll(async () => {
    // Clean up any test data or close database connections
    await db.end();
  });

  // Test GET /
  it('should return server status', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Server is running.');
  });

  // Test GET /products
  it('should fetch all products', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test GET /products with IDs
  it('should fetch products by IDs', async () => {
    const response = await request(app).get('/products').query({ ids: '1,2' });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test GET /products/:id
  it('should fetch product details by ID', async () => {
    const response = await request(app).get('/products/1'); // Ensure this ID exists in your database
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('Product_ID');
  });

  // Test POST /reviews
  it('should add a new review', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({ productId: '1', rating: 5, comment: 'Great product!' });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Review created successfully');
  });

  // Test POST /register
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        mobileNumber: '1234567890',
        dateOfBirth: '1990-01-01',
        captchaToken: 'fake-captcha-token'
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully.');
  });

  // Test POST /login
  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
        captchaToken: 'fake-captcha-token'
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });

  // Test PUT /user/:email
  it('should update user information', async () => {
    const response = await request(app)
      .put('/user/john.doe@example.com')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        mobileNumber: '0987654321',
        dateOfBirth: '1990-01-01',
        shippingAddress: '123 New Street',
        billingAddress: '456 Old Street'
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User information updated successfully.');
  });

  // Test DELETE /products/:id
  it('should delete a product', async () => {
    const response = await request(app).delete('/products/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product deleted successfully.');
  });

  // Test POST /forgot-password
  it('should send a password reset email', async () => {
    const response = await request(app)
      .post('/forgot-password')
      .send({
        email: 'john.doe@example.com',
        captchaToken: 'fake-captcha-token'
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password reset link sent to your email.');
  });

  // Test POST /reset-password/:token
  it('should reset the password', async () => {
    const response = await request(app)
      .post('/reset-password/fake-reset-token')
      .send({
        newPassword: 'newpassword123',
        captchaToken: 'fake-captcha-token'
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password has been reset successfully.');
  });

  describe('PUT /orders/:id', () => {
    // Assuming there's no need to re-establish the database connection here
    it('should update the order status and return success message', async () => {
      const orderId = 1; // Replace with an actual order ID from your test database
      const newStatus = 'Shipped';
  
      const response = await request(app)
        .put(`/orders/${orderId}`)
        .send({ status: newStatus })
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(response.body.message).toBe('Order status updated successfully.');
  
      // Verify that the order status was updated in the database
      const [order] = await db.query('SELECT status FROM orders WHERE Order_ID = ?', [orderId]);
      expect(order.status).toBe(newStatus);
    });
  
    it('should return 400 if status is not provided', async () => {
      const orderId = 1; // Replace with an actual order ID from your test database
  
      await request(app)
        .put(`/orders/${orderId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({ error: 'Status is required' });
    });
  
    it('should return 404 if order not found', async () => {
      const invalidOrderId = 9999; // Use an ID that does not exist
  
      await request(app)
        .put(`/orders/${invalidOrderId}`)
        .send({ status: 'Shipped' })
        .expect('Content-Type', /json/)
        .expect(404)
        .expect({ error: 'Order not found' });
    });
  });

  describe('POST /send-email', () => {
    it('should send an email successfully', async () => {
      const response = await request(app)
        .post('/send-email')
        .send({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<p>This is a test email</p>',
        })
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(response.body.message).toBe('Email sent successfully');
    });
  
    it('should return 500 if email sending fails', async () => {
      // You might need to mock the email sending failure for this test
      await request(app)
        .post('/send-email')
        .send({
          to: 'invalid-email', // or some other invalid data
          subject: 'Test Email',
          html: '<p>This is a test email</p>',
        })
        .expect('Content-Type', /json/)
        .expect(500)
        .expect({ error: 'Failed to send email' });
    });
  });

  describe('POST /send-contact-email', () => {
    it('should send a contact email successfully with valid reCAPTCHA', async () => {
      axios.post.mockResolvedValue({
        data: { success: true },
      });
  
      const response = await request(app)
        .post('/send-contact-email')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          mobile: '1234567890',
          inquiry: 'Test inquiry',
          captchaToken: 'valid-token', // Mock reCAPTCHA token
        })
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(response.body.message).toBe('Email sent successfully!');
    });
  
    it('should return 400 if reCAPTCHA verification fails', async () => {
      axios.post.mockResolvedValue({
        data: { success: false, 'error-codes': ['invalid-input-response'] },
      });
  
      const response = await request(app)
        .post('/send-contact-email')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          mobile: '1234567890',
          inquiry: 'Test inquiry',
          captchaToken: 'invalid-token',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({ message: 'Captcha verification failed', errorCodes: ['invalid-input-response'] });
    });
  });

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

  describe('GET /api/orders/details', () => {
    it('should retrieve order details with valid client secret', async () => {
      const response = await request(app)
        .get('/api/orders/details?client_secret=valid_client_secret'); // Use a valid client_secret
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('products');
    });
  
    it('should return 400 if client secret is missing', async () => {
      await request(app)
        .get('/api/orders/details')
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({ error: 'Client secret is required' });
    });
  
    it('should return 404 if payment not found or not successful', async () => {
      const response = await request(app)
        .get('/api/orders/details?client_secret=invalid_secret');
  
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Payment not found or not successful');
    });
  });
});
