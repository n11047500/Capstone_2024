import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../src/context/CartContext';
import CheckoutPage from '../../src/pages/Checkout/CheckoutPage';

// Mock child components
jest.mock('../../src/pages/Checkout/PersonalInfoForm.js', () => (props) => (
    <div>
      <h1>Personal Info Form</h1>
      <button onClick={() => props.onNext()}>Next</button>
    </div>
  ));
  
  jest.mock('../../src/pages/Checkout/ShippingMethodForm', () => (props) => (
    <div>
      <h1>Shipping Method Form</h1>
      <button onClick={() => props.onNext()}>Next</button>
      <button onClick={() => props.onBack()}>Back</button>
    </div>
  ));
  
  jest.mock('../../src/pages/Checkout/PaymentForm', () => (props) => (
    <div>
      <h1>Payment Form</h1>
      <button onClick={() => props.onBack()}>Back</button>
    </div>
  ));

describe('CheckoutPage Component', () => {
    const cartData = [
      { Product_Name: 'Item 1', Product_Price: 20, quantity: 2, Product_Image_URL: '', selectedOption: null },
      { Product_Name: 'Item 2', Product_Price: 15, quantity: 1, Product_Image_URL: '', selectedOption: null },
    ];
  
    const renderCheckoutPage = (cart = cartData) =>
        render(
            <MemoryRouter> {/* Wrap with MemoryRouter */}
                <CartContext.Provider value={{ cart }}>
                    <CheckoutPage />
                </CartContext.Provider>
            </MemoryRouter>
        );
  
    test('renders CheckoutPage with steps', () => {
      renderCheckoutPage();
  
      expect(screen.getByText(/1\. Personal Information/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Shipping Method/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Payment Method/i)).toBeInTheDocument();
    });
  
    test('navigates to Shipping Method step after filling Personal Info', () => {
      renderCheckoutPage();
  
      // Click next button in PersonalInfoForm
      fireEvent.click(screen.getByText(/next/i));
  
      expect(screen.getByText(/Shipping Method Form/i)).toBeInTheDocument();
    });
  
    test('navigates back to Personal Info step', () => {
      renderCheckoutPage();
  
      // Go to Shipping Method step first
      fireEvent.click(screen.getByText(/next/i));
  
      // Click back button
      fireEvent.click(screen.getByText(/back/i));
  
      expect(screen.getByText(/Personal Info Form/i)).toBeInTheDocument();
    });
  
    test('calculates total price correctly', () => {
        renderCheckoutPage();
    
        // Initial total should be 55 (20*2 + 15*1)
        const totalElement = screen.getByText(/total/i);
        const formattedTotal = `${(20 * 2 + 15 * 1).toFixed(2)}`; // Calculate formatted total
    
        // Check if the total element exists and contains the correct formatted total
        expect(totalElement).toBeInTheDocument(); // Ensure the "Total" label is present
        expect(totalElement.nextSibling).toHaveTextContent(formattedTotal); // Check the next sibling for the amount
    });
  
    test('renders Payment Form on next step and includes cart data', () => {
      renderCheckoutPage();
  
      // Navigate to Payment Form
      fireEvent.click(screen.getByText(/next/i)); // Personal Info Form
      fireEvent.click(screen.getByText(/next/i)); // Shipping Method Form
  
      expect(screen.getByText(/Payment Form/i)).toBeInTheDocument();
    });
  });