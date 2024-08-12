const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
  user: process.env.DB_USER || 'sql12706499',
  password: process.env.DB_PASSWORD || 'TApP5UqBDM',
  database: process.env.DB_NAME || 'sql12706499'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = connection;