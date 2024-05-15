const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./database');

app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
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
      res.status(500).send(err);
    } else if (results.length === 0) {
      res.status(404).send('Product not found');
    } else {
      res.json(results[0]);
    }
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});