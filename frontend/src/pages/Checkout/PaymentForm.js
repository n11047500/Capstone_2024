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
  
      const productIds = data.cart.flatMap(item =>
        Array(item.quantity).fill(`${item.Product_ID}:${item.selectedOption || ''}`).filter(Boolean)
      );
  
      const orderDetails = {
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        streetAddress: data.personalInfo.address,
        orderType: data.shippingMethod.shippingOption,
        productIds,
        totalAmount: data.totalAmount,
        paymentMethodId: paymentMethod.id,
      };
  
      console.log('Order details being sent:', orderDetails);
  
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });
  
      const responseData = await response.json();
      console.log('Backend response:', responseData); // Log the backend response
  
      if (response.ok && responseData.client_secret) {
        console.log('Order saved successfully.');
        navigate('/order-confirmation?client_secret=' + responseData.client_secret);
      } else if (responseData.client_secret) {
        // Handle further action required for 3D Secure or similar
        const { error: confirmError } = await stripe.confirmCardPayment(responseData.client_secret);
        if (confirmError) {
          console.error('Failed to confirm payment:', confirmError.message);
          alert('Failed to confirm payment.');
        } else {
          console.log('Payment confirmed successfully.');
          navigate('/order-confirmation?client_secret=' + responseData.client_secret);
        }
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
