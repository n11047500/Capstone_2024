// CheckoutPage.js
import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PersonalInfoForm from './PersonalInfoForm';
import ShippingMethodForm from './ShippingMethodForm';
import PaymentForm from './PaymentForm';
import { CartContext } from '../../context/CartContext';
import './CheckoutPage.css';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {},
    shippingMethod: {},
    paymentDetails: {},
  });

  // Access cart data from CartContext
  const { cart } = useContext(CartContext);

  // Function to calculate total (since subtotal is the same as the total)
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.Product_Price * item.quantity, 0).toFixed(2);
  };

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const handleFormDataChange = (section, data) => {
    setFormData((prev) => ({ ...prev, [section]: data }));
  };

  return (
    <>
      <Header />

      <div className="checkout-container">
        <div className="checkout-steps">
          <span className={step === 1 ? "active" : ""}>1. Personal Information</span>
          <span className={step === 2 ? "active" : ""}>2. Shipping Method</span>
          <span className={step === 3 ? "active" : ""}>3. Payment Method</span>
        </div>
        <div className="form-section">
          {step === 1 && (
            <PersonalInfoForm
              data={formData.personalInfo}
              onNext={handleNextStep}
              onChange={(data) => handleFormDataChange('personalInfo', data)}
            />
          )}
          {step === 2 && (
            <ShippingMethodForm
              data={formData.shippingMethod}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
              onChange={(data) => handleFormDataChange('shippingMethod', data)}
            />
          )}
          {step === 3 && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                data={{
                  ...formData, // Include all form data (personal info, shipping, etc.)
                  totalAmount: calculateTotal(), // Add calculated total amount
                }}
                onNext={handleNextStep} // This will now redirect directly to confirmation
                onBack={handlePreviousStep}
                onChange={(data) => handleFormDataChange('paymentDetails', data)}
              />
            </Elements>
          )}
        </div>
        <div className="summary-section">
          <h3>Summary</h3>
          {cart.map((item, index) => (
            <div key={index} className="summary-item">
              <span>{item.Product_Name} x {item.quantity}</span>
              <span>${(item.Product_Price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-item total">
            <span>Total</span>
            <span>${calculateTotal()}</span>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPage;