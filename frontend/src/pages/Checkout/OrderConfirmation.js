// OrderConfirmationPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const OrderConfirmationPage = () => {
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setStatus('error');
        return;
      }

      const stripe = await stripePromise;
      const { paymentIntent } = await stripe.retrievePaymentIntent(sessionId);

      if (paymentIntent) {
        setStatus(paymentIntent.status === 'succeeded' ? 'success' : 'failed');
      } else {
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
