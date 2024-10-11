import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './OrderConfirmation.css';

// Initialize Stripe with the publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Function to group products based on product IDs and details
const groupProducts = (productIds, productDetails) => {
  const grouped = {};

  // Create a map for quick lookup of product details by Product_ID
  const productDetailMap = new Map(
    productDetails.map(p => [String(p.Product_ID), p])
  );

  // Parse product IDs and their options from the string
  const productPairs = productIds.split(',').map(pair => {
    const [productId, option] = pair.split(':').map(item => item.trim());
    return { productId, option };
  });

  productPairs.forEach(product => {
    const key = `${product.productId}-${product.option || 'Default'}`;
    const productDetail = productDetailMap.get(String(product.productId));

    // If product details are not found, log an error and skip
    if (!productDetail) {
      console.error(`Product details not found for Product_ID: ${product.productId}`);
      return;
    }

    // Group products based on ID and option, updating quantity and price
    if (!grouped[key]) {
      grouped[key] = {
        productId: product.productId,
        option: product.option,
        quantity: 1,
        Product_Price: productDetail.Product_Price,
        Product_Name: productDetail.Product_Name,
        Product_Image_URL: productDetail.Product_Image_URL,
        totalPrice: productDetail.Product_Price,
      };
    } else {
      grouped[key].quantity += 1;
      grouped[key].totalPrice = grouped[key].Product_Price * grouped[key].quantity;
    }
  });

  return Object.values(grouped);
};

const OrderConfirmationPage = () => {
  // State variables to manage payment status, products, and order details
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Effect to check payment status when the component loads
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const clientSecret = searchParams.get('client_secret');
      if (!clientSecret) {
        setStatus('error');
        return;
      }

      try {
        const stripe = await stripePromise;
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        // Handle different payment statuses
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          setStatus('success');

          // Fetch order details from the backend
          const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/details?client_secret=${clientSecret}`);
          const orderData = await orderResponse.json();

          if (orderResponse.ok) {
            setProducts(orderData.products);
            setOrderDetails(orderData.order);
            const grouped = groupProducts(orderData.order.Product_IDs, orderData.products);
            setGroupedProducts(grouped);
          } else {
            console.error('Error fetching order details:', orderData.error);
          }
        } else if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
          setStatus('failed');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error retrieving payment status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  // Format date for displaying order details
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Formatter for currency in Australian Dollars (AUD)
  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  });

  // Handle continue shopping button click
  const handleContinueShopping = () => {
    clearCart();
    navigate('/browse');
  };

  return (
    <>
      <Header />
      <div className="confirmation-container">
        {/* Display loading, success, or error messages based on payment status */}
        {status === 'loading' && <p>Loading payment status...</p>}
        {status === 'success' && (
          <div className="order-details">
            <h3>Thank you for your order!</h3>
            <p>Your payment was successful. A confirmation email has been sent to you.</p>

            {/* Display order information */}
            <h4>Order Information</h4>
            <p><strong>Order Number:</strong> {orderDetails.Order_ID}</p>
            <p><strong>Order Date:</strong> {orderDetails.created_at ? formatDate(orderDetails.created_at) : 'N/A'}</p>
            <p><strong>Order Type:</strong> {orderDetails.Order_Type}</p>
            <p><strong>Email:</strong> {orderDetails.Email}</p>
            <p><strong>Phone Number:</strong> {orderDetails.Mobile}</p>
            {orderDetails.Order_Type === 'Delivery' && (
              <p><strong>Delivery Address:</strong> {orderDetails.Street_Address}</p>
            )}
            <p><strong>Total Amount:</strong> ${orderDetails.Total_Amount}</p>

            {/* Display purchased items */}
            <h4>Items Purchased:</h4>
            <table className='order_confirmation_table'>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Option</th>
                  <th>Quantity</th>
                  <th>Price (AUD)</th>
                </tr>
              </thead>
              <tbody>
                {groupedProducts.map((product) => (
                  <tr key={`${product.productId}-${product.option}`}>
                    <td><img src={product.Product_Image_URL} alt={product.Product_Name} /></td>
                    <td>{product.Product_Name}</td>
                    <td>{product.option || 'Default'}</td>
                    <td>{product.quantity}</td>
                    <td>{currencyFormatter.format(product.Product_Price * product.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {status === 'failed' && (
          <div>
            <h2>Payment Failed</h2>
            <p>Unfortunately, your payment could not be processed. Please try again or contact support.</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2>Something went wrong</h2>
            <p>We couldn't retrieve your payment status. Please contact support.</p>
          </div>
        )}
      </div>

      <div className="return-shopping-container">
        <button className="return-shopping-button" onClick={handleContinueShopping}>Continue Shopping</button>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;