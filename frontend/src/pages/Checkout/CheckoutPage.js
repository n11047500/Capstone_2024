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

// Initialize Stripe with the publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  // State to manage the checkout step
  const [step, setStep] = useState(1);
  // State to manage form data across different steps
  const [formData, setFormData] = useState({
    personalInfo: {},
    shippingMethod: {},
    paymentDetails: {},
  });

  // Access the cart data from the CartContext
  const { cart } = useContext(CartContext);

  // Formatter for currency
  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  });

  // Calculate the total price of items in the cart
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.Product_Price * item.quantity, 0);
  };

  // Handlers for navigating between steps
  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () => setStep((prev) => prev - 1);

  // Update form data as users fill out each step
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
                  ...formData, // Merge all form data (personal info, shipping, etc.)
                  cart, // Include cart data for product IDs
                  totalAmount: calculateTotal(), // Pass the total amount to be charged
                }}
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
              <img src={item.Product_Image_URL} alt={item.Product_Name} className="summary-image" />
              <div className="summary-details">
                <span>{item.Product_Name} x {item.quantity}</span>
                {item.selectedOption && <span className="product-option">{item.selectedOption}</span>}
                <span>{currencyFormatter.format(item.Product_Price * item.quantity)}</span>
              </div>
            </div>
          ))}
          <div className="summary-item total">
            <span >Total</span>
            <span>{currencyFormatter.format(calculateTotal())}</span>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPage;