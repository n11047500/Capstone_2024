const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE Product_ID = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      res.status(500).send(err);
    } else if (results.length === 0) {
      res.status(404).send('Product not found');
    } else {
      const product = results[0];
      res.json(product);
    }
  });
});

app.post('/register', (req, res) => {
  const { firstName, lastName, email, password, mobileNumber, dateOfBirth } = req.body;
  console.log('Received registration data:', req.body);

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).json({ error: 'Error creating user. Please try again.' });
    }

    if (results.length > 0) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists.' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ error: 'Error creating user. Please try again.' });
      }

      const query = 'INSERT INTO users (first_name, last_name, email, password, mobile_number, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [firstName, lastName, email, hash, mobileNumber, dateOfBirth], (err, result) => {
        if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).json({ error: 'Error creating user. Please try again.' });
        }

        res.status(201).json({ message: 'User created successfully.', email });
      });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt with email:', email);

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user from database:', err);
      return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }

    if (results.length === 0) {
      console.log('User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
      }

      if (!isMatch) {
        console.log('Incorrect password for user:', email);
        return res.status(401).json({ error: 'Incorrect password' });
      }

      res.status(200).json({ message: 'Login successful', email: user.email });
    });
  });
});

app.get('/user/:email', (req, res) => {
  const email = req.params.email;
  console.log('Fetching user with email:', email);

  const userQuery = 'SELECT user_id, first_name, last_name, email, mobile_number, date_of_birth FROM users WHERE email = ?';
  const addressesQuery = 'SELECT type, address FROM addresses WHERE user_id = ?';

  db.query(userQuery, [email], (err, userResults) => {
    if (err) {
      console.error('Error fetching user from database:', err);
      return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }

    if (userResults.length === 0) {
      console.log('User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResults[0];

    db.query(addressesQuery, [user.user_id], (err, addressResults) => {
      if (err) {
        console.error('Error fetching addresses from database:', err);
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
      }

      const addresses = {
        shippingAddress: '',
        billingAddress: '',
      };

      addressResults.forEach((address) => {
        if (address.type === 'shipping') {
          addresses.shippingAddress = address.address;
        } else if (address.type === 'billing') {
          addresses.billingAddress = address.address;
        }
      });

      res.status(200).json({ ...user, ...addresses });
    });
  });
});

app.put('/user/:email', (req, res) => {
  const email = req.params.email;
  const { firstName, lastName, mobileNumber, dateOfBirth, shippingAddress, billingAddress } = req.body;
  console.log('Updating user with email:', email);

  const updateUserQuery = 'UPDATE users SET first_name = ?, last_name = ?, mobile_number = ?, date_of_birth = ? WHERE email = ?';
  const getUserIDQuery = 'SELECT user_id FROM users WHERE email = ?';
  const updateAddressQuery = 'INSERT INTO addresses (user_id, type, address) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE address = VALUES(address)';

  db.query(updateUserQuery, [firstName, lastName, mobileNumber, dateOfBirth, email], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user information.' });
    }

    if (result.affectedRows === 0) {
      console.log('User not found for update:', email);
      return res.status(404).json({ error: 'User not found.' });
    }

    db.query(getUserIDQuery, [email], (err, userIDResults) => {
      if (err) {
        console.error('Error fetching user ID:', err);
        return res.status(500).json({ error: 'Failed to update user information.' });
      }

      const userId = userIDResults[0].user_id;

      db.query(updateAddressQuery, [userId, 'shipping', shippingAddress], (err) => {
        if (err) {
          console.error('Error updating shipping address:', err);
          return res.status(500).json({ error: 'Failed to update user information.' });
        }

        db.query(updateAddressQuery, [userId, 'billing', billingAddress], (err) => {
          if (err) {
            console.error('Error updating billing address:', err);
            return res.status(500).json({ error: 'Failed to update user information.' });
          }

          res.status(200).json({ message: 'User information updated successfully.' });
        });
      });
    });
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
