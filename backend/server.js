const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./database');
const nodemailer = require('nodemailer');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Fetch all products or multiple products by IDs
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
app.post('/register', (req, res) => {
  const { firstName, lastName, email, password, mobileNumber, dateOfBirth, role = 'customer' } = req.body;

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
});

// Login an existing user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

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
app.post('/send-contact-email', (req, res) => {
  const { first_name, last_name, email, mobile, inquiry } = req.body;

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
});

app.post('/create-checkout-session', async (req, res) => {
  const { items } = req.body;

  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.Product_Name,
          images: [item.Product_Image_URL],
        },
        unit_amount: item.Product_Price * 100, // Stripe expects amounts in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Endpoint to handle order creation
app.post('/api/orders', async (req, res) => {
  const { paymentMethodId, orderDetails } = req.body;

  try {
    // Here, assume you have already validated the order details on the client side
    const { firstName, lastName, mobile, email, streetAddress, productIds, orderType, totalAmount } = orderDetails;

    // Ensure totalAmount is a valid number
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid total amount');
    }

    // Create a payment intent with a return_url
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents and round to ensure it is an integer
      currency: 'aud', // Ensure your currency matches
      payment_method: paymentMethodId,
      confirm: true, // Automatically confirm the payment
      return_url: `${req.headers.origin}/order-confirmation`, // Add return URL for redirect-based payment methods
    });

    // Insert order into the database
    const insertQuery = `
      INSERT INTO orders (Total_Amount, Product_IDs, First_Name, Last_Name, Mobile, Email, Street_Address, Order_Type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Completed')
    `;
    const params = [amount, productIds, firstName, lastName, mobile, email, streetAddress, orderType];

    db.query(insertQuery, params, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Failed to save order.');
      }
      res.status(200).json({ message: 'Order saved successfully.' });
    });
  } catch (err) {
    console.error('Error processing order:', err);
    res.status(500).send('Error processing payment or saving order.');
  }
});


app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
