const mysql = require('mysql');

function createDBConnection() {
  const connection = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12706499',
    password: 'TApP5UqBDM',
    database: 'sql12706499',
  });

  return connection;
}

module.exports = createDBConnection;
