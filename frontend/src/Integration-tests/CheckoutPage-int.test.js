import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import { CartContext } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';


// Mock loadStripe
const stripePromise = loadStripe('pk_test_51Pl1vMKVAjsu4RonjbHanvbh0FxJBQJiW3XMirAArOC2NdUrUpYqffSKSHZG3khhiBEvQSNBl4kZu51FlU3ti9ts00CneAmZUu');

// Mock Cart Data
const mockCart = [
  {
    Product_ID: 101,
    Product_Name: 'Sample Product 1',
    Product_Price: 100.0,
    quantity: 2,
    Product_Image_URL: 'https://example.com/product1.jpg',
    selectedOption: 'Option 1',
  },
  {
    Product_ID: 102,
    Product_Name: 'Sample Product 2',
    Product_Price: 50.0,
    quantity: 1,
    Product_Image_URL: 'https://example.com/product2.jpg',
    selectedOption: 'Option 2',
  },
];


jest.mock('@stripe/react-stripe-js', () => {
    const stripeMock = {
      elements: jest.fn(),
      createToken: jest.fn(),
      createPaymentMethod: jest.fn(),
      confirmCardPayment: jest.fn(),
    };
    
    return {
      Elements: ({ children }) => <div>{children}</div>,
      CardElement: (props) => <input data-testid="stripe-card-element" {...props} />,
      useStripe: () => stripeMock,
      useElements: () => ({ getElement: jest.fn() }),
    };
  });
  
  describe('CheckoutPage Integration Tests', () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <CartContext.Provider value={{ cart: mockCart }}>
            <Elements stripe={stripePromise}>
              <CheckoutPage />
            </Elements>
          </CartContext.Provider>
        </MemoryRouter>
      );
    });
  

  it('should render the Personal Information form as the first step', () => {
    // Instead of using getByText, we can use getByRole if applicable
    const personalInfoHeading = screen.getByRole('heading', { name: /Personal Information/i });
    
    expect(personalInfoHeading).toBeInTheDocument();
    
    // Check if the first step has the active class
    const activeStep = screen.getByText(/1. Personal Information/i);
    expect(activeStep).toHaveClass('active');
  });

  it('should proceed to the Shipping Method step after filling out Personal Info', async () => {
    // Fill out the personal info form
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'john.doe@example.com' } });

    // Find the "Continue to Shipping" button and click it
    const continueButton = screen.getByRole('button', { name: /Continue to Shipping/i });
    fireEvent.click(continueButton);

    // Verify that the Shipping Method form is rendered
    await waitFor(() => {
        const shippingMethodHeading = screen.getByRole('heading', { name: /Shipping Method/i });
        expect(shippingMethodHeading).toBeInTheDocument();
        expect(screen.getByText(/2. Shipping Method/i)).toHaveClass('active');
    });
});


  it('should proceed to the Payment Method step after selecting a shipping method', async () => {
    // Step 1: Fill out the personal info form and click "Continue to Shipping"
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'john.doe@example.com' } });

    const continueToShippingButton = screen.getByRole('button', { name: /Continue to Shipping/i });
    fireEvent.click(continueToShippingButton);
  
    // Step 2: Select "Click and Collect" by clicking the corresponding div
    const clickAndCollectOption = screen.getByText(/Click and Collect/i);
    fireEvent.click(clickAndCollectOption);
  
    // Click the "Next" button after selecting the shipping method
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
  
    // Step 3: Ensure we have proceeded to the Payment step
    await waitFor(() => {
      const paymentMethodElement = screen.getByRole('heading', { name: /Payment Method/i });
      expect(paymentMethodElement).toBeInTheDocument();
    });
  });

  it('should display the correct cart summary and total', () => {
    // Verify that the cart summary items are rendered correctly
    expect(screen.getByText(/Sample Product 1 x 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Option 1/i)).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();

    expect(screen.getByText(/Sample Product 2 x 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Option 2/i)).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();

    // Verify the total amount is correctly calculated
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
  });

  it('should render Stripe elements during the Payment step', async () => {
    // Step 1: Fill out personal info and move to the shipping step
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'john.doe@example.com' } });

    const continueToShippingButton = screen.getByRole('button', { name: /Continue to Shipping/i });
    fireEvent.click(continueToShippingButton);

    // Step 2: Select "Click and Collect" and move to the payment step
    fireEvent.click(screen.getByText(/Click and Collect/i));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 3: Wait for Stripe CardElement to render
    await waitFor(() => {
      const stripeCardElement = screen.getByTestId('stripe-card-element');
      expect(stripeCardElement).toBeInTheDocument();
    });
  });
  
});
