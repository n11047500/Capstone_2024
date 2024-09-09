import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const OrderConfirmationPage = () => {
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams(); // Correct usage to get query parameters

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const clientSecret = searchParams.get('client_secret'); // Correctly get the client_secret parameter
      if (!clientSecret || !clientSecret.includes('_secret_')) { // Check for the correct client_secret format
        setStatus('error');
        return;
      }

      try {
        const stripe = await stripePromise;
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret); // Correct Stripe method

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          setStatus('success');
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
  }, [searchParams]); // Ensure searchParams is in the dependency array

  return (
    <>
      <Header />
      <div className="confirmation-container">
        {status === 'loading' && <p>Loading payment status...</p>}
        {status === 'success' && (
          <div>
            <h2>Thank you for your order!</h2>
            <p>Your payment was successful. A confirmation email has been sent to you.</p>
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