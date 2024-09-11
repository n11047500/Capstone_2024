require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'db-mysql-ezee-planter-boxes-do-user-17736031-0.e.db.ondigitalocean.com',
  port: 25060,
  user: 'doadmin',
  password: process.env.DB_PASSWORD,
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