const mysql = require('mysql2');

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST || 'db-mysql-ezee-planter-boxes-do-user-17736031-0.e.db.ondigitalocean.com',
    port: process.env.DB_PORT || '25060',
    user: process.env.DB_USER || 'doadmin',
    password: process.env.DB_PASSWORD || 'AVNS_xqbdexEl3Y8JCM8uL78',
    database: process.env.DB_NAME || 'defaultdb',
    ssl: {
      rejectUnauthorized: false
    }
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
    } else {
      console.log('Connected to the database.');
    }
  });

  connection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection lost. Reconnecting...');
      handleDisconnect(); // Reconnect on connection lost
    } else {
      throw err; // Re-throw other errors
    }
  });
}

handleDisconnect();

module.exports = connection;
