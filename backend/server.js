const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
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
      console.error(err);
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
      console.error(err);
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

// Register user
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, mobileNumber, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (first_name, last_name, email, mobile_number, password) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, mobileNumber, hashedPassword],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Error creating user' });
        } else {
          res.status(201).json({ message: 'User created successfully' });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error logging in' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    }
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
