// OrderConfirmation.js
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

  return (
    <>
      <Header />
      <div className="confirmation-container">
        {status === 'loading' && <p>Loading payment status...</p>}
        {status === 'success' && (
          <div>
            <h2>Thank you for your order!</h2>
            <p>Your payment was successful. A confirmation email has been sent to you.</p>
            <h3>Items Purchased:</h3>
            <ul>
              {products.map(product => (
                <li key={product.Product_ID}>
                  {product.Product_Name} - {product.Product_Price} AUD
                </li>
              ))}
            </ul>
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
