const mysql = require('mysql2');
const db = require('../database');

// Mock the mysql2 module
jest.mock('mysql2', () => {
  return {
    createConnection: jest.fn(() => ({
      connect: jest.fn((callback) => callback(null)), // Simulate successful connection by default
      on: jest.fn(),
    })),
  };
});

describe('Database Connection Module', () => {
  let connection;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    connection = mysql.createConnection(); // Create a new connection mock for each test

     // Mock the 'on' method implementation
     connection.on.mockImplementation((event, callback) => {
      if (event === 'error') {
        connection.errorCallback = callback; // Capture the error callback
      }
    });
  });

  test('should create a new MySQL connection with correct configuration', () => {
    db.connect();

    expect(mysql.createConnection).toHaveBeenCalledTimes(2);
    expect(mysql.createConnection).toHaveBeenCalledWith(expect.objectContaining({
      host: expect.any(String),
      port: expect.any(String),
      user: expect.any(String),
      password: expect.any(String),
      database: expect.any(String),
      ssl: { rejectUnauthorized: false },
    }));
  });

  test('should handle connection errors and retry after 2 seconds', (done) => {
    // Mock connection failure
    mysql.createConnection.mockImplementationOnce(() => ({
      connect: jest.fn((callback) => callback(new Error('Connection error'))),
      on: jest.fn(),
    }));

    jest.useFakeTimers(); // Use fake timers to control setTimeout
    db.connect();

    expect(mysql.createConnection).toHaveBeenCalledTimes(2);
    
    // Fast-forward time to simulate retry
    jest.advanceTimersByTime(2000);

    expect(mysql.createConnection).toHaveBeenCalledTimes(3); // Should attempt to reconnect
    done();
  });

  test('should handle database errors and reconnect on PROTOCOL_CONNECTION_LOST', () => {
    db.connect(); // Call the connection method

    // Ensure the 'on' method is called with the 'error' event
    expect(connection.on).toHaveBeenCalledWith('error', expect.any(Function));

    // Simulate connection loss
    connection.errorCallback({ code: 'PROTOCOL_CONNECTION_LOST' });

    // Verify that the correct error message is logged
    expect(console.error).toHaveBeenCalledWith('Database connection lost. Reconnecting...');

    // Verify that reconnection is attempted
    expect(mysql.createConnection).toHaveBeenCalledTimes(2); // Should call connect again
  });

  test('should handle unhandled errors without reconnecting', () => {
    db.connect(); // Call the connection method

    // Ensure the 'on' method is called with the 'error' event
    expect(connection.on).toHaveBeenCalledWith('error', expect.any(Function));

    // Simulate an unhandled error
    connection.errorCallback({ code: 'SOME_OTHER_ERROR' });

    // Verify that the correct error message is logged
    expect(console.error).toHaveBeenCalledWith('Database error:', { code: 'SOME_OTHER_ERROR' });

    // Ensure that reconnection is not attempted
    expect(mysql.createConnection).toHaveBeenCalledTimes(1); // Should not attempt to reconnect
  });
});