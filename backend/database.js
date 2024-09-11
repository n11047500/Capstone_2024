// const mysql = require('mysql');

// let connection;

// function handleDisconnect() {
//   connection = mysql.createConnection({
//     host: process.env.DB_HOST || 'db-mysql-ezee-planter-boxes-do-user-17736031-0.e.db.ondigitalocean.com',
//     user: process.env.DB_USER || 'doadmin',
//     password: process.env.DB_PASSWORD || 'AVNS_xqbdexEl3Y8JCM8uL78',
//     database: process.env.DB_NAME || 'defaultdb'
//   });

//   connection.connect((err) => {
//     if (err) {
//       console.error('Error connecting to the database:', err.stack);
//       setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
//     } else {
//       console.log('Connected to the database.');
//     }
//   });

//   connection.on('error', (err) => {
//     console.error('Database error:', err);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//       console.error('Database connection lost. Reconnecting...');
//       handleDisconnect(); // Reconnect on connection lost
//     } else {
//       throw err; // Re-throw other errors
//     }
//   });
// }

// handleDisconnect();

// module.exports = connection;



// const mysql = require('mysql');

// let connection;

// function handleDisconnect() {
//   connection = mysql.createConnection({
//         host: process.env.DB_HOST || 'db-mysql-ezee-planter-boxes-do-user-17736031-0.e.db.ondigitalocean.com',
//         port: 25060,
//         user: process.env.DB_USER || 'doadmin',
//         password: process.env.DB_PASSWORD || 'AVNS_xqbdexEl3Y8JCM8uL78',
//         database: process.env.DB_NAME || 'defaultdb'
//       });

//   connection.connect((err) => {
//     if (err) {
//       console.log('Error connecting to MySQL, retrying in 2 seconds:', err);
//       setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
//     } else {
//       console.log('Connected to MySQL');
//     }
//   });

//   connection.on('error', (err) => {
//     console.log('MySQL error:', err);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT') {
//       handleDisconnect();
//     } else {
//       throw err;
//     }
//   });
// }

// handleDisconnect();


// // Export the connection
// module.exports = connection;



const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'db-mysql-ezee-planter-boxes-do-user-17736031-0.e.db.ondigitalocean.com',
  port: 25060,
  user: 'doadmin',
  password: 'AVNS_xqbdexEl3Y8JCM8uL78',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false  // Allow self-signed certificates
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
});


// Export the connection
module.exports = connection;