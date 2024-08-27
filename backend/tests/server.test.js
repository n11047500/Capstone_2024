const request = require('supertest');
const app = require('../server');

jest.mock('../database', () => {
  return {
    query: jest.fn(),
  };
});

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / should return server status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Server is running.');
  });

  it('GET /products should return products list', async () => {
    const db = require('../database');
    db.query.mockImplementation((query, callback) => {
      callback(null, [{ Product_ID: 1, Product_Name: 'Product 1' }]);
    });

    const res = await request(app).get('/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([{ Product_ID: 1, Product_Name: 'Product 1' }]);
  });

  it('POST /register should create a new user', async () => {
    const bcrypt = require('bcrypt');
    bcrypt.hash = jest.fn((password, saltRounds, callback) => {
      callback(null, 'hashedPassword');
    });

    const db = require('../database');
    db.query.mockImplementation((query, values, callback) => {
      if (query.includes('SELECT')) {
        callback(null, []); // No existing user
      } else if (query.includes('INSERT')) {
        callback(null, { insertId: 1 });
      }
    });

    const res = await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        mobileNumber: '1234567890',
        dateOfBirth: '1990-01-01',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('User created successfully.');
  });

});
