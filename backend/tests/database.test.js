const mysql = require('mysql2');

// Mock the mysql2 module
jest.mock('mysql2', () => ({
  createConnection: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    on: jest.fn(),
  })),
}));

const { connect, getConnection } = require('../database'); // Adjust the path as needed

describe('Database Connection', () => {
  let mockConnection;

  beforeEach(() => {
    jest.resetModules();
    mockConnection = mysql.createConnection();
  });

  afterEach(() => {
    jest.clearAllMocks();  // Clear mocks after each test
  });

  it('should connect to the database without errors', () => {
    mockConnection.connect.mockImplementationOnce((cb) => cb(null)); // Simulate successful connection

    connect(); // Call the connect function

    expect(mockConnection.connect).toHaveBeenCalledTimes(1);
    expect(getConnection()).toBe(mockConnection);
  });

  it('should retry connection on initial connection error', () => {
    mockConnection.connect.mockImplementationOnce((cb) => cb(new Error('Connection Error'))); // Simulate connection error
    jest.useFakeTimers(); // Use fake timers

    connect(); // Call the connect function

    // Verify that the connect method was called once
    expect(mockConnection.connect).toHaveBeenCalledTimes(1);

    // Advance timers to simulate the retry logic
    jest.advanceTimersByTime(2000);
    expect(mockConnection.connect).toHaveBeenCalledTimes(2); // Verify it retried
  });

  it('should reconnect on "PROTOCOL_CONNECTION_LOST" error', () => {
    const lostConnectionError = { code: 'PROTOCOL_CONNECTION_LOST' };

    mockConnection.connect.mockImplementationOnce((cb) => cb(null)); // Simulate successful initial connection
    connect(); // Call the connect function

    // Store the callback for the error event
    let errorCallback;
    mockConnection.on.mockImplementation((event, callback) => {
      if (event === 'error') {
        errorCallback = callback; // Save the error callback
      }
    });

    // Simulate the 'error' event with 'PROTOCOL_CONNECTION_LOST'
    if (errorCallback) {
      errorCallback(lostConnectionError); // Invoke the stored callback
    }

    // Verify that the `connect` method is called again for reconnection
    expect(mockConnection.connect).toHaveBeenCalledTimes(2);
  });
  
  it('should throw other types of errors', () => {
    const otherError = { code: 'SOME_OTHER_ERROR' };

    // Simulate successful initial connection
    mockConnection.connect.mockImplementationOnce((cb) => cb(null));

    // Import the module
    const db = require('../database'); // Ensure this imports and uses the mock correctly

    // Call the connect function explicitly
    db.connect();

    // Simulate the 'error' event with another error code
    mockConnection.on.mockImplementation((event, callback) => {
      if (event === 'error') callback(otherError);
    });

    // Ensure that non-connection-lost errors are thrown
    expect(() => {
      mockConnection.on.mock.calls[0][1](otherError);
    }).toThrow();
  });
});
