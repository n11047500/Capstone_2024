const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
  user: process.env.DB_USER || 'sql12706499',
  password: process.env.DB_PASSWORD || 'TApP5UqBDM',
  database: process.env.DB_NAME || 'sql12706499'
});

function handleDisconnect() {
  connection == mysql.createConnection({
    host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
    user: process.env.DB_USER || 'sql12706499',
    password: process.env.DB_PASSWORD || 'TApP5UqBDM',
    database: process.env.DB_NAME || 'sql12706499'
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
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      handleDisconnect(); // Reconnect on connection loss
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;
