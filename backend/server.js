const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./database');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const multer = require('multer');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Stores file in memory
const uploadFile = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Fetch all products or multiple products by IDs {i dont think this is needed}
app.get('/products', (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(',') : [];

  // If product IDs are provided, filter products by those IDs
  if (ids.length > 0) {
    const query = `
      SELECT * FROM products WHERE Product_ID IN (${ids.map(() => '?').join(',')});
    `;

    db.query(query, ids, (err, results) => {
      if (err) {
        console.error('Error fetching products by IDs:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json(results);
    });
  } else {
    // If no IDs are provided, fetch all products
    db.query('SELECT * FROM products', (err, results) => {
      if (err) {
        console.error('Error fetching all products:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json(results);
    });
  }
});

// Fetch specific product details
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;

  db.query('SELECT * FROM products WHERE Product_ID = ?', [productId], (err, productResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (productResults.length === 0) {
      return res.status(404).send('Product not found');
    }

    const product = productResults[0];

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

      const productWithReviewInfo = {
        ...product,
        averageRating,
        reviewCount
      };
      
      res.json(productWithReviewInfo);
    });
  });
});

// Fetch reviews for a product
app.get('/reviews/:id', (req, res) => {
  const productId = req.params.id;

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
      return res.status(404).json({ error: 'No reviews found for this product' });
    }

    res.json(reviews);
  });
});

// Add a new review
app.post('/reviews', (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const userId = req.session ? req.session.user_id : null;

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

// Register a new user
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, mobileNumber, dateOfBirth, role = 'customer', captchaToken } = req.body;

  // Verify the reCAPTCHA token
  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha is required' });
  }

  try {
    // Verify reCAPTCHA token with Google API
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY, // Your reCAPTCHA secret key
        response: captchaToken
      }
    });

    console.log(response.data); // Log Google's reCAPTCHA response

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'Error creating user. Please try again.' });
      }

      if (results.length > 0) {
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
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA token' });
  }
});

// Login an existing user
app.post('/login', async (req, res) => {
  const { email, password, captchaToken } = req.body;

  // Verify the reCAPTCHA token
  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha is required' });
  }

  try {
    // Verify reCAPTCHA token with Google API
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY, // Your reCAPTCHA secret key
        response: captchaToken
      }
    });

    console.log(response.data); // Log Google's reCAPTCHA response

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Error fetching user from database:', err);
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ error: 'An error occurred. Please try again.' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Incorrect password' });
        }

        res.status(200).json({
          message: 'Login successful',
          email: user.email,
          role: user.role
        });
      });
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA token' });
  }
});

// Fetch a user by email
app.get('/user/:email', (req, res) => {
  const email = req.params.email;

  const userQuery = 'SELECT user_id, first_name, last_name, email, mobile_number, date_of_birth, role FROM users WHERE email = ?';
  const addressesQuery = 'SELECT type, address FROM addresses WHERE user_id = ?';

  db.query(userQuery, [email], (err, userResults) => {
    if (err) {
      console.error('Error fetching user from database:', err);
      return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }

    if (userResults.length === 0) {
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

// Update a user's information
app.put('/user/:email', (req, res) => {
  const email = req.params.email;
  const { firstName, lastName, mobileNumber, dateOfBirth, shippingAddress, billingAddress } = req.body;

  const updateUserQuery = 'UPDATE users SET first_name = ?, last_name = ?, mobile_number = ?, date_of_birth = ? WHERE email = ?';
  const getUserIDQuery = 'SELECT user_id FROM users WHERE email = ?';
  const updateAddressQuery = 'INSERT INTO addresses (user_id, type, address) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE address = VALUES(address)';

  db.query(updateUserQuery, [firstName, lastName, mobileNumber, dateOfBirth, email], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user information.' });
    }

    if (result.affectedRows === 0) {
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

// Update user role
app.post('/update-role', (req, res) => {
  const { email, role } = req.body;

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

// Forgot password
app.post('/forgot-password', async (req, res) => {
  const { email, captchaToken } = req.body;

  // Verify the reCAPTCHA token
  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha is required' });
  }

  try {
    // Verify reCAPTCHA token with Google API
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY, // Your reCAPTCHA secret key
        response: captchaToken
      }
    });

    console.log(response.data); // Log Google's reCAPTCHA response

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    // Check if the email exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Error fetching user from database:', err);
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
      }

      // If no user is found with the given email
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const user = results[0];


      // Create a reset token
      const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

      // Send email with reset link
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Click the link to reset your password: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending email.' });
        }

        console.log('Password reset email sent:', info.response);
        return res.json({ message: 'Password reset link sent to your email.' });
      });
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA token' });
  }
});

// Reset password
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword, captchaToken } = req.body;

  // Verify the reCAPTCHA token
  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha is required' });
  }

  try {
    // Verify reCAPTCHA token with Google API
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY, // Your reCAPTCHA secret key
        response: captchaToken
      }
    });

    console.log(response.data); // Log Google's reCAPTCHA response

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    // Verify the reset token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const email = decoded.email;

      // Check if the email exists in the database
      const query = 'SELECT * FROM users WHERE email = ?';
      db.query(query, [email], (err, results) => {
        if (err) {
          console.error('Error fetching user from database:', err);
          return res.status(500).json({ error: 'An error occurred. Please try again.' });
        }

        // If no user is found with the given email
        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found.' });
        }

        const user = results[0];

        // Hash the new password
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Error hashing password.' });
          }

          // Update user password in the database
          const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
          db.query(updateQuery, [hashedPassword, email], (updateErr, updateResults) => {
            if (updateErr) {
              console.error('Error updating password in database:', updateErr);
              return res.status(500).json({ error: 'An error occurred while updating the password.' });
            }

            return res.json({ message: 'Password has been reset successfully.' });
          });
        });
      });
    } catch (error) {
      console.error('Invalid or expired token:', error);
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA token' });
  }
});

// Add a new product
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

// Update a product
app.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price, quantity, description, dimensions, options, imageUrl } = req.body;

  const query = `
    UPDATE products
    SET Product_Name = ?, Product_Price = ?, Quantity_Available = ?, Description = ?, Product_Dimensions = ?, Product_Options = ?, Product_Image_URL = ?
    WHERE Product_ID = ?
  `;
  const values = [name, price, quantity, description, dimensions, options, imageUrl, productId];

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

// Delete a product
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

// Fetch details of a specific order
app.get('/orders/:id', (req, res) => {
  const orderId = req.params.id;

  // Query to fetch order details
  const orderQuery = `
    SELECT Order_ID, Total_Amount, Product_IDs, First_Name, Last_Name, Mobile, Email, Street_Address, Order_Type, status, created_at AS Order_Date
    FROM orders
    WHERE Order_ID = ?;
  `;

  db.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order details:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (orderResults.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderDetails = orderResults[0];

    // Split Product_IDs to parse them into individual products and their options
    const productPairs = orderDetails.Product_IDs.split(',').map(pair => {
      const [productId, option] = pair.split(':').map(item => item.trim());
      return { productId, option };
    });

    const productIds = productPairs.map(pair => pair.productId);

    // Fetch product details from the products table
    const productsQuery = `SELECT * FROM products WHERE Product_ID IN (${productIds.map(() => '?').join(',')})`;

    db.query(productsQuery, productIds, (err, products) => {
      if (err) {
        console.error('Error fetching product details:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const productsWithOptions = productPairs.map(pair => {
        const product = products.find(p => p.Product_ID.toString() === pair.productId);
        return product ? { ...product, option: pair.option } : null;
      }).filter(product => product !== null);

      res.json({ ...orderDetails, products: productsWithOptions });
    });
  });
});


// Fetch all orders or filter by status
app.get('/orders', (req, res) => {
  const status = req.query.status;

  let orderQuery = `
    SELECT Order_ID, Total_Amount, Product_IDs, First_Name, Last_Name, Mobile, Email, Street_Address, Order_Type, status
    FROM orders
  `;

  if (status) {
    orderQuery += ` WHERE status = ?`;
  }

  db.query(orderQuery, [status], (err, orderResults) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json(orderResults);
  });
});

// Update the status of an order
app.put('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updateOrderQuery = `
    UPDATE orders
    SET status = ?
    WHERE Order_ID = ?;
  `;

  db.query(updateOrderQuery, [status, orderId], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully.' });
  });
});

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Endpoint to send email
app.post('/send-email', (req, res) => {
  const { to, subject, html } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  });
});

// Contact us email sending function
app.post('/send-contact-email', async (req, res) => {
  const { first_name, last_name, email, mobile, inquiry, captchaToken } = req.body;

  // Verify the reCAPTCHA token
  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha is required' });
  }

  try {
    // Verify reCAPTCHA token with Google API
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY, // Your reCAPTCHA secret key
        response: captchaToken
      }
    });

    console.log(response.data); // Log Google's reCAPTCHA response

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    const transporter = nodemailer.createTransport({
      service: 'Outlook365',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'joyalvincentofficial@gmail.com',
      subject: 'New Contact Us Inquiry',
      html: ` Hi Team, <br><br> You have received a new inquiry from the contact form on your website. Here are the details:<br><br>
      <p><strong>Name:</strong> ${first_name} ${last_name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Inquiry:</strong> ${inquiry}</p><br><br>
      <p>Thank you</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(200).json({ message: 'Email sent successfully!' });
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA token' });
  }
});

// Sending order details to the customer and database
app.post('/api/orders', async (req, res) => {
  const { firstName, lastName, email, phone, streetAddress, orderType, productIds, totalAmount, paymentMethodId } = req.body;
  const currentDateTime = new Date();

  if (!firstName || !lastName || !email || !phone || !streetAddress || !orderType || !productIds || totalAmount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'aud',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${req.headers.origin}/order-confirmation`,
      off_session: true,
    });

    if (paymentIntent.status === 'succeeded') {
      const productIdsString = productIds.join(',');
      const clientSecret = paymentIntent.client_secret;

      const query = `
        INSERT INTO orders (First_Name, Last_Name, Email, Mobile, Street_Address, Order_Type, Product_IDs, Total_Amount, client_secret, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
      `;

      db.query(query, [firstName, lastName, email, phone, streetAddress, orderType, productIdsString, totalAmount, clientSecret, currentDateTime], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create order' });
        }

        const orderId = result.insertId;
        const fetchProductsQuery = `SELECT * FROM products WHERE Product_ID IN (${productIds.map(() => '?').join(',')})`;
        
        db.query(fetchProductsQuery, productIds.map(pid => pid.split(':')[0]), (err, products) => {
          if (err) {
            console.error('Error fetching product details:', err);
            return res.status(500).json({ error: 'Failed to fetch product details' });
          }

          // Construct the HTML email body
          const productDetailsTable = products.map(product => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <img src="${product.Product_Image_URL}" alt="${product.Product_Name}" style="width: 50px; height: 50px;" />
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">${product.Product_Name}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${product.Product_Option || 'Default'}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">1</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${product.Product_Price}</td>
            </tr>
          `).join('');

          const emailHTML = `
          <html>
          <body>
            <p>Dear ${firstName},</p>
            <p>Thank you for your payment! Your order has been received and is currently being processed.</p>
            
            <h4>Order Details:</h4>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Order Date:</strong> ${currentDateTime.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          
            <h4>Products Ordered:</h4>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <thead>
                <tr>
                  <th style="padding: 8px; border: 1px solid #ddd;">Image</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Product Name</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Option</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${productDetailsTable}
              </tbody>
            </table>
          
            <p>We will notify you once your order has been shipped.</p>
            <p>If you have any questions or need further assistance, please don't hesitate to contact our customer support team.</p>
          
            <p>Thank you for choosing EZee Planter Boxes!</p>
          
            <p>Best regards,</p>
            <p><strong>EZee Planter Boxes</strong><br>Customer Support Team</p>
          </body>
          </html>
          `;

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Order Payment Confirmation',
            html: emailHTML
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending confirmation email:', error);
              return res.status(500).json({ error: 'Failed to send email' });
            }
            console.log('Confirmation email sent:', info.response);

            // Return success response including order details and payment client secret
            res.json({
              id: orderId,
              client_secret: paymentIntent.client_secret,
              products: products,
            });
          });
        });
      });
    } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
      res.json({ client_secret: paymentIntent.client_secret });
    } else {
      res.status(400).json({ error: 'Payment requires further action or failed.' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});


app.get('/api/orders/details', async (req, res) => {
  const clientSecret = req.query.client_secret;

  if (!clientSecret) {
    return res.status(400).json({ error: 'Client secret is required' });
  }

  try {
    const paymentIntentId = clientSecret.split('_secret_')[0];

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return res.status(404).json({ error: 'Payment not found or not successful' });
    }

    const query = `SELECT * FROM orders WHERE client_secret = ?`;
    db.query(query, [clientSecret], (err, orderResults) => {
      if (err) {
        console.error('Error fetching order details:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (orderResults.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orderResults[0];
      const productIds = order.Product_IDs.split(',').map(pair => pair.split(':')[0].trim());

      const productsQuery = `SELECT * FROM products WHERE Product_ID IN (${productIds.map(() => '?').join(',')})`;

      db.query(productsQuery, productIds, (err, products) => {
        if (err) {
          console.error('Error fetching product details:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({
          order,
          products,
        });
      });
    });
  } catch (error) {
    console.error('Error retrieving payment details:', error);
    res.status(500).json({ error: 'Failed to retrieve payment details' });
  }
});

// // Nodemailer sendEmail function
// const sendEmail = async (formDataObj) => {
//   try {
//     // Nodemailer transporter configuration
//     const transporter = nodemailer.createTransport({
//       service: 'Outlook365',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // HTML email template
//     const emailHTML = `
//       <style>
//         p {
//           text-align: center;
//         }
//         table, th, td {
//           border: 1px solid black;
//           width: 50%;
//           margin: 0 auto;
//         }
//         .center {
//           margin-left: auto;
//           margin-right: auto;
//         }
//       </style>

//       <h3 style="text-align:center;">Thank You for Your Order!</h3>
//       <p>We’ve received your custom planter box order with the following details:</p>

//       <table class="center">
//         <tr>
//           <th colspan="2">Product Information</th>
//         </tr>
//         <tr>
//           <td>Color Type:</td>
//           <td>${formDataObj.colorType || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td>Selected Color:</td>
//           <td>${formDataObj.color || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td>Custom Color:</td>
//           <td>${formDataObj.customColor || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td>Width (cm):</td>
//           <td>${formDataObj.width || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td>Wicking:</td>
//           <td>${formDataObj.wicking || 'N/A'}</td>
//         </tr>
//       </table>

//       <br><br>

//       <table class="center">
//         <tr>
//           <th colspan="2">Personal Information</th>
//         </tr>
//         <tr>
//           <td>First Name:</td>
//           <td>${formDataObj.firstName || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td>Last Name:</td>
//           <td>${formDataObj.lastName || 'N/A'}</td>
//         </tr>
//         <tr>
//           <td>Email:</td>
//           <td>${formDataObj.email || 'N/A'}</td>
//         </tr>
//       </table>

//       <br><br>

//       <table class="center">
//         <tr>
//           <th colspan="2">Additional Information</th>
//         </tr>
//         <tr>
//           <td style="width:70%" colspan="2"><strong>Comments: </strong>${formDataObj.comment || 'No comments'}</td>
//         </tr>
//       </table>
//     `;

//     // Email options, including the file attachment
//     let mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Your Custom Planter Box Order',
//       html: emailHTML,
//       attachments: formDataObj.file ? [{
//         filename: formDataObj.file.originalname,
//         content: formDataObj.file.buffer,
//         cid: formDataObj.file.filename
//       }] : []
//     };

//     // Send email
//     let info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: ' + info.response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };


app.use(express.urlencoded({ extended: true }));

// POST route for form submission
app.post('/submit-form', uploadFile.single('file'), async (req, res) => {
  try {
    // Extract form data from the request body
    const formData = req.body;
    const file = req.file; // Get the file from multer

    // Prepare the form data object
    const formDataObj = {
      colorType: formData.colorType,
      color: formData.color,
      customColor: formData.customColor,
      width: formData.width,
      wicking: formData.wicking,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      comment: formData.comment,
      file: file // Include file data
    };

    // After saving data, send the email
    await sendEmail(formDataObj);

    // Respond with a success message
    res.status(200).json({ message: 'Form submitted and email sent successfully' });
  } catch (error) {
    console.error('Error in form submission:', error);
    res.status(500).json({ message: 'Error in form submission' });
  }
});


// Search route
app.get('/api/search', (req, res) => {
  const query = req.query.query;  // Get the query from the request

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const sql = `SELECT * FROM products WHERE Product_Name LIKE ? OR Description LIKE ?`;
  const values = [`%${query}%`, `%${query}%`];  // Use the query in both conditions

  db.query(sql, values, (err, results) => {  // Pass both values into the query
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);  // Send back the results as JSON
  });
});


app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

module.exports = app;