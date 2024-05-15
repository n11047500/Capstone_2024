const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12706499',
  password: 'TApP5UqBDM',
  database: 'sql12706499'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = connection;