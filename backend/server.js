const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
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

      const colorOptions = ['Cottage Green', 'Domain', 'Monument', 'Pearl White', 'Riversand', 'Satin Black'];
      const sizeOptions = ['Small', 'Medium', 'Large'];

      if (['Accessibility Planter Box', 'Mini Standard Planter Box', 'Small Standard Planter Box', 'Medium Standard Planter Box', 'Large Standard Planter Box'].includes(product.Product_Name)) {
        product.Product_Options = colorOptions;
      } else if (['Side Table', 'Trellis'].includes(product.Product_Name)) {
        product.Product_Options = sizeOptions;
      } else {
        product.Product_Options = [];
      }

      res.json(product);
    }
  });
});

app.post('/register', (req, res) => {
  const { firstName, lastName, email, password, mobileNumber, dateOfBirth } = req.body;
  console.log('Received registration data:', req.body);

  // Check if user already exists
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

    // Hash password before storing in the database
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

  const query = 'SELECT first_name, last_name, email, mobile_number, date_of_birth FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user from database:', err);
      return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }

    if (results.length === 0) {
      console.log('User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(results[0]);
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
