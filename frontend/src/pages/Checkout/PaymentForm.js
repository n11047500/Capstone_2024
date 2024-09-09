// PaymentForm.js
import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

const PaymentForm = ({ data, onBack, onChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!stripe || !elements) {
      console.error('Stripe has not yet loaded.');
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('CardElement not found.');
      return;
    }
  
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
  
    if (error) {
      console.error('Payment failed:', error);
      return;
    }
  
    try {
      const totalAmount = parseFloat(data.totalAmount);
      if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error('Invalid total amount');
      }
  
      // Prepare the data object for the API call
      const orderDetails = {
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        streetAddress: data.personalInfo.address,
        orderType: data.shippingMethod.shippingOption,
        productIds: data.cart.map(item => `${item.Product_ID}:${item.selectedOption || ''}`).filter(Boolean),
        totalAmount: data.totalAmount,
      };
  
      // Log the data being sent to check for missing fields
      console.log('Order details being sent:', orderDetails);
  
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          ...orderDetails, // Spread the order details here to ensure all fields are included
        }),
      });
  
      if (response.ok) {
        console.log('Order saved successfully.');
        navigate('/order-confirmation'); // Redirect to order confirmation on success
      } else {
        const errorMessage = await response.text();
        console.error('Failed to save order:', errorMessage);
        alert(`Order could not be processed: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error during order processing:', err);
      alert('An error occurred while processing your order. Please try again.');
    }
  };  

  return (
    <div className="form-section">
      <h2>Payment Method</h2>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <div className="button-group">
          <button type="button" onClick={onBack}>
            Back
          </button>
          <button type="submit" disabled={!stripe}>
            Pay
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
