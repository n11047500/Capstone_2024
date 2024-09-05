const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const axios = require('axios');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); 

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





app.post('/register', (req, res) => {
  const { firstName, lastName, email, password, mobileNumber, dateOfBirth, role = 'customer' } = req.body;
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

      const query = 'INSERT INTO users (first_name, last_name, email, password, mobile_number, date_of_birth, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [firstName, lastName, email, hash, mobileNumber, dateOfBirth, role], (err, result) => {
        if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).json({ error: 'Error creating user. Please try again.' });
        }

        res.status(201).json({ message: 'User created successfully.', email, role });
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

      res.status(200).json({ 
        message: 'Login successful', 
        email: user.email,
        role: user.role
      });
    });
  });
});

app.get('/user/:email', (req, res) => {
  const email = req.params.email;
  console.log('Fetching user with email:', email);

  const userQuery = 'SELECT user_id, first_name, last_name, email, mobile_number, date_of_birth, role FROM users WHERE email = ?';
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

app.post('/update-role', (req, res) => {
  const { email, role } = req.body;

  console.log('Received role update request:', { email, role });

  db.query('UPDATE users SET role = ? WHERE email = ?', [role, email], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ message: 'An error occurred during the role update.' });
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Role updated successfully.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  });
});

app.post('/add-product', (req, res) => {
  const { name, price, quantity, description, dimensions, options, imageUrl } = req.body;

  if (!name || !price || !quantity || !description || !dimensions) {
    return res.status(400).json({ message: 'All fields except options and image URL are required.' });
  }

  const query = `
    INSERT INTO products (Product_Name, Product_Price, Quantity_Available, Description, Product_Dimensions, Product_Options, Product_Image_URL)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [name, price, quantity, description, dimensions, options, imageUrl];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).json({ message: 'An error occurred while adding the product.' });
    }

    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  });
});

app.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price, quantity, description, dimensions, options, imageUrl } = req.body;

  const optionsString = Array.isArray(options) ? options.join(', ') : '';

  const query = `
    UPDATE products
    SET Product_Name = ?, Product_Price = ?, Quantity_Available = ?, Description = ?, Product_Dimensions = ?, Product_Options = ?, Product_Image_URL = ?
    WHERE Product_ID = ?
  `;
  const values = [name, price, quantity, description, dimensions, optionsString, imageUrl, productId];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'An error occurred while updating the product.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product updated successfully.' });
  });
});


app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;

  const query = 'DELETE FROM products WHERE Product_ID = ?';
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ message: 'An error occurred while deleting the product.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted successfully.' });
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
