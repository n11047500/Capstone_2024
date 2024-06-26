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

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
