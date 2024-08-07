// /backend/test/database.test.js
const mysql = require('mysql');

// Mock the mysql module
jest.mock('mysql', () => ({
  createConnection: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  })),
}));

describe('Database Connection', () => {
  let mockConnection;

  beforeEach(() => {
    // Set up mock connection
    mockConnection = mysql.createConnection();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should connect to the database without errors', async () => {
    // Simulate a successful connection
    mockConnection.connect.mockImplementationOnce((cb) => cb(null));

    // Import the connection creation function
    const createDBConnection = require('../database');
    const connection = createDBConnection(); // Create a new connection instance

    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('Connection error:', err);
          return reject(err);
        }
        console.log('Connected successfully');
        resolve();
      });
    });

    expect(mockConnection.connect).toHaveBeenCalledTimes(1);
  });

  it('should handle database connection errors', async () => {
    // Simulate a connection error
    mockConnection.connect.mockImplementationOnce((cb) => cb(new Error('Connection Error')));

    // Import the connection creation function
    const createDBConnection = require('../database');
    const faultyConnection = createDBConnection(); // Create a new connection instance

    await new Promise((resolve, reject) => {
      faultyConnection.connect((err) => {
        try {
          expect(err).toBeTruthy();
          expect(err.message).toBe('Connection Error');
          resolve();
        } catch (error) {
          console.error('Error during connection:', error);
          reject(error);
        }
      });
    });

    expect(mockConnection.connect).toHaveBeenCalledTimes(1);
  });
});
