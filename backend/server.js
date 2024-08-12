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
      console.log(product);
    }
  });
});




app.get('/reviews/:id', (req, res) => {
  const productId = req.params.id;
  console.log(`Received request for productId: ${productId}`); // Log the request

  db.query('SELECT * FROM Reviews WHERE product_ID = ?', [productId], (err, reviews) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (reviews.length === 0) {
      console.log('No reviews found for productId:', productId); // Log when no reviews are found
      res.status(404).json({ error: 'No reviews found for this product' });
    } else {
      console.log('Reviews found:', reviews); // Log the reviews found
      //res.json(results);
    }

      db.query('SELECT rating FROM Reviews WHERE product_ID = ?', [productId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const ratings = results.map(result => result.rating); // Extract all rating values
      console.log('Fetched ratings for product:', ratings); // Log all the ratings for the product

      // Send the reviews and the specific rating to the frontend
      return res.json({ reviews, ratings });
  });
  });


});


app.post('/reviews', (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Insert the review into the database
  db.query(
    'INSERT INTO Reviews (product_ID, rating, comment) VALUES (?, ?, ?)',
    [productId, rating, comment],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ message: 'Review created successfully' });
    }
  );
});




app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
