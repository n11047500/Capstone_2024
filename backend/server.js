const express = require('express');                               // Express framework for building the API
const cors = require('cors');                                     // Middleware for enabling Cross-Origin Resource Sharing
const bcrypt = require('bcryptjs');                               // Library for hashing passwords securely
const bodyParser = require('body-parser');                        // Middleware for parsing request bodies
const db = require('./database');                                 // Custom database module for connecting to MySQL
const nodemailer = require('nodemailer');                         // Nodemailer for sending emails
const jwt = require('jsonwebtoken');                              // JSON Web Token library for secure authentication
const axios = require('axios');                                   // Axios for making HTTP requests (used for reCAPTCHA)
require('dotenv').config();                                       // Load environment variables from a .env file
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  // Stripe for payment processing
const multer = require('multer');                                 // Multer for handling file uploads
const path = require('path');
const fs = require('fs');

// Initialise the Express app
const app = express();

// Middleware configuration
app.use(cors());              // Enable CORS for all routes
app.use(bodyParser.json());   // Parse JSON bodies in incoming requests
app.use(express.json());      // Ensure incoming requests are parsed as JSON

// Get the database connection instance
const connection = db.getConnection();

// Configure Multer for file uploads with memory storage
const storage = multer.memoryStorage();

const uploadFile = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images are allowed!'), false);
    }
  }
});

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Root endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Endpoint to fetch products, with optional filtering by IDs
app.get('/products', (req, res) => {
  // Get product IDs from query parameters, if provided
  const ids = req.query.ids ? req.query.ids.split(',') : [];

  if (ids.length > 0) {
    // Query the database for specific products by their IDs
    const query = `
      SELECT * FROM products WHERE Product_ID IN (${ids.map(() => '?').join(',')});
    `;

    connection.query(query, ids, (err, results) => {
      if (err) {
        console.error('Error fetching products by IDs:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json(results);
    });
  } else {
    // If no IDs are provided, fetch all products
    connection.query('SELECT * FROM products', (err, results) => {
      if (err) {
        console.error('Error fetching all products:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json(results);
    });
  }
});

// Endpoint to fetch details of a specific product, including average rating and review count
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;

  // Query the database for the product with the specified ID
  connection.query('SELECT * FROM products WHERE Product_ID = ?', [productId], (err, productResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    // If the product is not found, return a 404 response
    if (productResults.length === 0) {
      return res.status(404).send('Product not found');
    }

    const product = productResults[0];

    // Query the database for average rating and review count for this product
    connection.query(`
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

// Endpoint to register a new user, with reCAPTCHA verification
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, mobileNumber, dateOfBirth, role = 'customer', captchaToken } = req.body;

  // Check if the reCAPTCHA token is present
  if (!captchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA is required' });
  }

  try {
    // Verify reCAPTCHA token with Google API
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: captchaToken
      }
    });

    const { success, 'error-codes': errorCodes } = response.data;

    // If reCAPTCHA verification fails, return an error
    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    // Check if the user already exists in the database
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkQuery, [email], (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'Error creating user. Please try again.' });
      }

      // If a user with the email already exists, return an error
      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists.' });
      }

      // Encrpyt the user's password before storing it in the database
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).json({ error: 'Error creating user. Please try again.' });
        }

        // Insert the new user into the database
        const query = 'INSERT INTO users (first_name, last_name, email, password, mobile_number, date_of_birth, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [firstName, lastName, email, hash, mobileNumber, dateOfBirth, role], (err, result) => {
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

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
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

  connection.query(userQuery, [email], (err, userResults) => {
    if (err) {
      console.error('Error fetching user from database:', err);
      return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResults[0];

    connection.query(addressesQuery, [user.user_id], (err, addressResults) => {
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
  const checkAddressQuery = 'SELECT address_id FROM addresses WHERE user_id = ? AND type = ?';
  const insertAddressQuery = 'INSERT INTO addresses (user_id, type, address) VALUES (?, ?, ?)';
  const updateAddressQuery = 'UPDATE addresses SET address = ? WHERE user_id = ? AND type = ?';

  connection.query(updateUserQuery, [firstName, lastName, mobileNumber, dateOfBirth, email], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user information - User Update.' });
    }

    if (result.affectedRows === 0) {
      console.error('User not found during update attempt.');
      return res.status(404).json({ error: 'User not found.' });
    }

    connection.query(getUserIDQuery, [email], (err, userIDResults) => {
      if (err) {
        console.error('Error fetching user ID:', err);
        return res.status(500).json({ error: 'Failed to update user information - User ID Fetch.' });
      }

      if (userIDResults.length === 0) {
        console.error('User ID not found for the email provided.');
        return res.status(404).json({ error: 'User ID not found.' });
      }

      const userId = userIDResults[0].user_id;

      // Helper function to update or insert address
      const updateOrInsertAddress = (type, address) => {
        return new Promise((resolve, reject) => {
          connection.query(checkAddressQuery, [userId, type], (err, results) => {
            if (err) {
              console.error(`Error checking ${type} address:`, err);
              return reject(new Error(`Failed to update user information - ${type} Address Check.`));
            }

            if (results.length > 0) {
              // Update existing address
              connection.query(updateAddressQuery, [address, userId, type], (err) => {
                if (err) {
                  console.error(`Error updating ${type} address:`, err);
                  return reject(new Error(`Failed to update user information - ${type} Address Update.`));
                }
                resolve();
              });
            } else {
              // Insert new address
              connection.query(insertAddressQuery, [userId, type, address], (err) => {
                if (err) {
                  console.error(`Error inserting ${type} address:`, err);
                  return reject(new Error(`Failed to update user information - ${type} Address Insert.`));
                }
                resolve();
              });
            }
          });
        });
      };

      // Execute the update/insert for both addresses
      Promise.all([
        updateOrInsertAddress('shipping', shippingAddress),
        updateOrInsertAddress('billing', billingAddress)
      ])
        .then(() => {
          res.status(200).json({ message: 'User information updated successfully.' });
        })
        .catch((error) => {
          console.error('Error during address update/insert:', error.message);
          res.status(500).json({ error: error.message });
        });
    });
  });
});

// Update user role
app.post('/update-role', (req, res) => {
  const { email, role } = req.body;

  connection.query('UPDATE users SET role = ? WHERE email = ?', [role, email], (err, result) => {
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
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
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

    const { success, 'error-codes': errorCodes } = response.data;
    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    // Check if the email exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
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
      connection.query(query, [email], (err, results) => {
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
          connection.query(updateQuery, [hashedPassword, email], (updateErr, updateResults) => {
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

  connection.query(query, values, (err, result) => {
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

  connection.query(query, values, (err, result) => {
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
  connection.query(query, [productId], (err, result) => {
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

  connection.query(orderQuery, [orderId], (err, orderResults) => {
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

    connection.query(productsQuery, productIds, (err, products) => {
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

  connection.query(orderQuery, [status], (err, orderResults) => {
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

  connection.query(updateOrderQuery, [status, orderId], (err, result) => {
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
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'Captcha verification failed', errorCodes });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL,
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

      connection.query(query, [firstName, lastName, email, phone, streetAddress, orderType, productIdsString, totalAmount, clientSecret, currentDateTime], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create order' });
        }

        const orderId = result.insertId;
        const fetchProductsQuery = `SELECT * FROM products WHERE Product_ID IN (${productIds.map(() => '?').join(',')})`;

        connection.query(fetchProductsQuery, productIds.map(pid => pid.split(':')[0]), (err, products) => {
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
    connection.query(query, [clientSecret], (err, orderResults) => {
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

      connection.query(productsQuery, productIds, (err, products) => {
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

// Nodemailer sendEmail function
const sendEmail = async (formDataObj) => {
  try {
    console.log('Recipient email:', formDataObj.email);
    console.log('Form Data Object:', formDataObj);

    // Ensure email is defined
    if (!formDataObj.email) {
      throw new Error('No recipient email provided');
    }

    // Nodemailer transporter configuration
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // HTML email template
    const emailHTML = `
      <style>
        p {
          text-align: center;
        }
        table, th, td {
          border: 1px solid black;
          width: 50%;
          margin: 0 auto;
        }
        .center {
          margin-left: auto;
          margin-right: auto;
        }
      </style>

      <h3 style="text-align:center;">Thank You for Your Order!</h3>
      <p>We’ve received your custom planter box order with the following details:</p>

      <table class="center">
        <tr>
          <th colspan="2">Product Information</th>
        </tr>
        <tr>
          <td>Color Type:</td>
          <td>${formDataObj.colorType || 'N/A'}</td>
        </tr>
        <tr>
          <td>Selected Color:</td>
          <td>${formDataObj.color || 'N/A'}</td>
        </tr>
        <tr>
          <td>Custom Color:</td>
          <td>${formDataObj.customColor || 'N/A'}</td>
        </tr>
        <tr>
          <td>Width (cm):</td>
          <td>${formDataObj.width || 'N/A'}</td>
        </tr>
        <tr>
          <td>Wicking:</td>
          <td>${formDataObj.wicking || 'N/A'}</td>
        </tr>
      </table>

      <br><br>

      <table class="center">
        <tr>
          <th colspan="2">Personal Information</th>
        </tr>
        <tr>
          <td>First Name:</td>
          <td>${formDataObj.firstName || 'N/A'}</td>
        </tr>
        <tr>
          <td>Last Name:</td>
          <td>${formDataObj.lastName || 'N/A'}</td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>${formDataObj.email || 'N/A'}</td>
        </tr>
      </table>

      <br><br>

      <table class="center">
        <tr>
          <th colspan="2">Additional Information</th>
        </tr>
        <tr>
          <td style="width:70%" colspan="2"><strong>Comments: </strong>${formDataObj.comment || 'No comments'}</td>
        </tr>
      </table>
    `;

    // Email options, including the file attachment
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TESTING_TO,
      subject: 'Your Custom Planter Box Order',
      html: emailHTML,
      attachments: formDataObj.file ? [{
        filename: formDataObj.file.originalname, // Use the original file name
        content: formDataObj.file.buffer, // Use the file buffer if using memory storage
      }] : []
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

app.use(express.urlencoded({ extended: true }));

// POST route for form submission
app.post('/submit-form', uploadFile.single('file'), async (req, res) => {
  try {
    // Extract form data from the request body
    const formData = req.body;
    const file = req.file; // Get the file from multer

    // Log incoming form data and file
    console.log('Received form data:', formData);
    console.log('Received file:', file);

    if (!file) {
      console.error('No file uploaded');
    }

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
      file: file || null // Include file data
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

  connection.query(sql, values, (err, results) => {  // Pass both values into the query
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);  // Send back the results as JSON
  });
});


// Fetch reviews for a product
app.get('/reviews/:id', (req, res) => {
  const productId = req.params.id;
  console.log(`Received request for productId: ${productId}`); // Log the request

  // Query to get reviews and first names
  connection.query(`
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

    // Query to get ratings
    connection.query('SELECT rating FROM Reviews WHERE product_id = ?', [productId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const ratings = results.map(result => result.rating); // Extract all rating values
      console.log('Fetched ratings for product:', ratings); // Log all the ratings for the product

      // Query to count the total number of reviews
      connection.query('SELECT COUNT(*) AS review_count FROM Reviews WHERE product_id = ?', [productId], (err, countResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const reviewCount = countResults[0].review_count; // Get the review count from the result

        // Query to calculate the average rating
        connection.query('SELECT AVG(rating) AS average_rating FROM Reviews WHERE product_id = ?', [productId], (err, avgResults) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          const averageRating = avgResults[0].average_rating || 0; // Get the average rating from the result

          // Send the reviews, ratings, review count, and average rating to the frontend
          return res.json({ reviews, ratings, reviewCount, averageRating });
        });
      });
    });
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

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ message: 'Review created successfully' });
  });
});

// Starting the server on the specified port
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

module.exports = { app, sendEmail }; // Export the app and sendEmail function
