const mysql = require('mysql2'); // Import the mysql2 package for database connection

let connection; // Variable to hold the database connection instance

// Function to handle database connection and reconnection on errors
function handleDisconnect() {
  // Create a new MySQL connection using environment variables
  connection = mysql.createConnection({
    host: process.env.DB_HOST || 'db-mysql-ezee-planter-boxes-do-user-17736031-0.e.db.ondigitalocean.com',
    port: process.env.DB_PORT || '25060',
    user: process.env.DB_USER || 'doadmin',
    password: process.env.DB_PASSWORD || 'AVNS_xqbdexEl3Y8JCM8uL78',
    database: process.env.DB_NAME || 'defaultdb',
    ssl: {
      rejectUnauthorized: false // Allow self-signed certificates for SSL
    }
  });

  // Establish the connection to the database
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      // Retry the connection after 2 seconds if an error occurs
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to the database.');
    }
  });

  // Listen for errors on the connection
  connection.on('error', (err) => {
    console.error('Database error:', err);
    // Reconnect if the connection is lost (e.g., due to network issues)
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection lost. Reconnecting...');
      handleDisconnect(); // Call handleDisconnect to re-establish connection
    } else {
      throw err; // Throw other errors for handling elsewhere
    }
  });
}

// Export the connect function and the current connection instance
module.exports = {
  connect: handleDisconnect, // Export the connection function to be called elsewhere
  getConnection: () => connection // Export a method to retrieve the current connection instance
};

// Establish the initial database connection
handleDisconnect();