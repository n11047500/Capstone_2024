const mysql = require('mysql');

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
    mockConnection = mysql.createConnection();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database without errors', async () => {
    mockConnection.connect.mockImplementationOnce((cb) => cb(null));

    const createDBConnection = require('../database');
    const connection = createDBConnection();

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
    mockConnection.connect.mockImplementationOnce((cb) => cb(new Error('Connection Error')));

    const createDBConnection = require('../database');
    const faultyConnection = createDBConnection();

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
