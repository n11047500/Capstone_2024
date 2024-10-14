const mysql = require('mysql2'); // Import the mysql2 package for database connection

// Mock the mysql2 package
jest.mock('mysql2', () => {
  const mockConnection = {
    connect: jest.fn((callback) => callback(null)), // Simulate successful connection
    end: jest.fn(),
    on: jest.fn(),
  };
  
  return {
    createConnection: jest.fn(() => mockConnection),
  };
});

// Mock console.log
console.log = jest.fn(); // Mock console.log to track calls

// Import your database module after mocking
const { connect, getConnection } = require('../database'); // Adjust the path as necessary

describe('Database Connection Module', () => {
  let mockConnection;

  beforeEach(() => {
    // Get the mock connection from the mocked mysql2
    mockConnection = mysql.createConnection(); 
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test('should establish a connection successfully', () => {
    connect(); // Call the connect function

    expect(mysql.createConnection).toHaveBeenCalled(); // Ensure createConnection was called
    expect(mockConnection.connect).toHaveBeenCalled(); // Ensure connect was called
    expect(console.log).toHaveBeenCalledWith('Connected to the database.'); // Ensure success message is logged
  });

  test('should retry connection on error', () => {
    jest.useFakeTimers(); // Use fake timers for setTimeout

    // Simulate a connection error
    mockConnection.connect.mockImplementationOnce((callback) => {
      callback(new Error('Connection error')); // Call the callback with an error
    });

    connect(); // Call the connect function
    expect(mockConnection.connect).toHaveBeenCalled(); // Check that connect was called

    // Fast-forward time to simulate retry
    jest.advanceTimersByTime(2000);

    // Ensure connect is called again after 2 seconds
    expect(mockConnection.connect).toHaveBeenCalledTimes(2);
  });

  test('should handle connection errors and reconnect on connection lost', () => {
    connect(); // Establish the initial connection
  
    // Simulate the first connection lost error
    const errorCallback = mockConnection.on.mock.calls[0][1];
    errorCallback({ code: 'PROTOCOL_CONNECTION_LOST' }); // Simulate the error
  
    // Ensure that handleDisconnect is called once after the error
    expect(mysql.createConnection).toHaveBeenCalledTimes(3); // Expect createConnection to have been called twice total
  
    // Check if the second call was due to the lost connection
    expect(mockConnection.connect).toHaveBeenCalledTimes(2); // The connect method should also be called again
  });
  

  test('should throw errors for unhandled connection errors', () => {
    connect(); // Establish the initial connection

    // Simulate an unhandled error
    const errorCallback = mockConnection.on.mock.calls[0][1];
    expect(() => {
      errorCallback({ code: 'SOME_OTHER_ERROR' });
    }).toThrow(); // Ensure that the error is thrown
  });
});