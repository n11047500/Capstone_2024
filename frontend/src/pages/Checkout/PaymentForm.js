import React, {useContext} from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext'; // Import CartContext

const PaymentForm = ({ data, onBack, onChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext); // Access clearCart from context

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
    
      const responseData = await response.json(); // Read the response body once
    
      if (response.ok) {
        console.log('Order saved successfully.');
        // Clear the cart after successful payment
        clearCart();

         // Send confirmation email
        fetch('/send-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              email: orderDetails.email,
              firstName: orderDetails.firstName,
              lastName: orderDetails.lastName,
              orderId: responseData.id,
              totalAmount: orderDetails.totalAmount
          })
      }).then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Confirmation email sent successfully.');
            } else {
                console.error('Failed to send confirmation email:', data.error);
            }
        })
        .catch(error => console.error('Error sending confirmation email:', error));

        navigate('/order-confirmation?client_secret=' + responseData.client_secret);
      } else if (responseData.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(responseData.client_secret);
        if (confirmError) {
          console.error('Failed to confirm payment:', confirmError.message);
          alert('Failed to confirm payment.');
        } else {
          console.log('Payment confirmed successfully.');
          navigate('/order-confirmation?client_secret=' + responseData.client_secret);
        }
      } else {
        console.error('Failed to save order:', responseData.error);
        alert(`Order could not be processed: ${responseData.error}`);
      }
    } catch (err) {
      console.error('Error during order processing:', err);
      alert('An error occurred while processing your order. Please try again.');
    }
  };

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        color: '#333',
        fontSize: '16px',
        fontFamily: '"Arial", sans-serif',
        '::placeholder': {
          color: '#888',
        },
        iconColor: '#888',
      },
      invalid: {
        color: '#e74c3c',
        iconColor: '#e74c3c',
      },
    },
  };

  return (
    <div className="payment-form">
      <h2 className="payment-form__title">Payment Method</h2>
      <form onSubmit={handleSubmit} className="payment-form__form">
        <div className="payment-form__card-element-container">
          <CardElement className="payment-form__card-element" options={cardElementOptions} data-testid="stripe-card-element" />
        </div>
        <div className="button-group">
          <button type="button" onClick={onBack} className="back-payment-button">
            Back
          </button>
          <button type="submit" disabled={!stripe}>
            Pay
          </button>
        </div>
      </form>
      <br />
      <p className="payment-form__note">Payment is processed securely using Stripe</p>
    </div>
  );
};


export default PaymentForm;
