import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './OrderConfirmation.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const OrderConfirmationPage = () => {
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]); // State to hold purchased products
  const [orderDetails, setOrderDetails] = useState({}); // State to hold additional order details

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

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          setStatus('success');

          // Fetch order details from backend
          const orderResponse = await fetch(`/api/orders/details?client_secret=${clientSecret}`);
          const orderData = await orderResponse.json();

          if (orderResponse.ok) {
            setProducts(orderData.products); // Store the purchased products
            setOrderDetails(orderData.order); // Store the order details

            // Debugging to check fetched products
            console.log("Fetched products:", orderData.products);
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

  // Function to group products by Product ID and Option, while accumulating quantity
  const groupProducts = (products) => {
    const grouped = {};

    products.forEach((product) => {
      const key = `${product.Product_ID}-${product.option || 'Default'}`;
      if (!grouped[key]) {
        grouped[key] = {
          ...product,
          quantity: product.Quantity ? parseInt(product.Quantity, 10) : 1, // Ensure quantity is a number
        };
      } else {
        grouped[key].quantity += product.Quantity ? parseInt(product.Quantity, 10) : 1; // Accumulate the quantity
      }
    });

    console.log("Grouped products:", grouped); // Debugging to check grouping logic

    return Object.values(grouped);
  };

  const groupedProducts = groupProducts(products);

  // Format the date properly
  const formattedDate = orderDetails.Order_Date
    ? new Date(orderDetails.Order_Date).toLocaleDateString()
    : 'N/A';

  return (
    <>
      <Header />
      <div className="confirmation-container">
        {status === 'loading' && <p>Loading payment status...</p>}
        {status === 'success' && (
          <div className="order-details">
            <h3>Thank you for your order!</h3>
            <p>Your payment was successful. A confirmation email has been sent to you.</p>

            {/* Display order information */}
            <h4>Order Information</h4>
            <p><strong>Order Number:</strong> {orderDetails.Order_ID}</p>
            <p><strong>Order Date:</strong> {formattedDate}</p>
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
                  <tr key={`${product.Product_ID}-${product.option}`}>
                    <td><img src={product.Product_Image_URL} alt={product.Product_Name} /></td>
                    <td>{product.Product_Name}</td>
                    <td>{product.option || 'Default'}</td>
                    <td>{product.quantity}</td>
                    <td>${(product.Product_Price * product.quantity).toFixed(2)}</td>
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
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;
