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

  // Query to get product details
  db.query('SELECT * FROM products WHERE Product_ID = ?', [productId], (err, productResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (productResults.length === 0) {
      return res.status(404).send('Product not found');
    }

    const product = productResults[0];

    // Query to get average rating and review count
    db.query(`
      SELECT AVG(rating) AS average_rating, COUNT(*) AS review_count
      FROM Reviews
      WHERE product_id = ?
    `, [productId], (err, reviewsResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error');
      }

      const averageRating = reviewsResults[0].average_rating || 0;
      const reviewCount = reviewsResults[0].review_count || 0;

      // Add product options based on product name
      const colorOptions = ['Cottage Green', 'Domain', 'Monument', 'Pearl White', 'Riversand', 'Satin Black'];
      const sizeOptions = ['Small', 'Medium', 'Large'];

      if (['Accessibility Planter Box', 'Mini Standard Planter Box', 'Small Standard Planter Box', 'Medium Standard Planter Box', 'Large Standard Planter Box'].includes(product.Product_Name)) {
        product.Product_Options = colorOptions;
      } else if (['Side Table', 'Trellis'].includes(product.Product_Name)) {
        product.Product_Options = sizeOptions;
      } else {
        product.Product_Options = [];
      }

      // Combine product details with review metrics
      const productWithReviewInfo = {
        ...product,
        averageRating,
        reviewCount
      };

      res.json(productWithReviewInfo);
      console.log(productWithReviewInfo);
    });
  });
});





app.get('/reviews/:id', (req, res) => {
  const productId = req.params.id;
  console.log(`Received request for productId: ${productId}`); // Log the request

  // Query to get reviews and first names
  db.query(`
    SELECT r.review_id, r.product_id, r.rating, r.comment, u.first_name
    FROM Reviews r
    LEFT JOIN users u ON r.user_id = u.user_id
    WHERE r.product_id = ?
  `, [productId], (err, reviews) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (reviews.length === 0) {
      console.log('No reviews found for productId:', productId); // Log when no reviews are found
      return res.status(404).json({ error: 'No reviews found for this product' });
    }

    console.log('Reviews found:', reviews); // Log the reviews found

    // Query to get ratings
    db.query('SELECT rating FROM Reviews WHERE product_id = ?', [productId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const ratings = results.map(result => result.rating); // Extract all rating values
      console.log('Fetched ratings for product:', ratings); // Log all the ratings for the product

      // Query to count the total number of reviews
      db.query('SELECT COUNT(*) AS review_count FROM Reviews WHERE product_id = ?', [productId], (err, countResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const reviewCount = countResults[0].review_count; // Get the review count from the result
        console.log('Total review count for product:', reviewCount); // Log the review count

        // Query to calculate the average rating
        db.query('SELECT AVG(rating) AS average_rating FROM Reviews WHERE product_id = ?', [productId], (err, avgResults) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          const averageRating = avgResults[0].average_rating || 0; // Get the average rating from the result
          console.log('Average rating for product:', averageRating); // Log the average rating

          // Send the reviews, ratings, review count, and average rating to the frontend
          return res.json({ reviews, ratings, reviewCount, averageRating });
        });
      });
    });
  });
});




app.use(express.json()); 


app.post('/reviews', (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const userId = req.session ? req.session.user_id : null; // Ensure req.session is defined

  const query = 'INSERT INTO Reviews (product_ID, user_ID, rating, comment) VALUES (?, ?, ?, ?)';
  const params = [productId, userId, rating, comment];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ message: 'Review created successfully' });
  });
});








app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
