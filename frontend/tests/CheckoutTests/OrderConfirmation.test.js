import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CartContext } from '../../src/context/CartContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderConfirmationPage from '../../src/pages/Checkout/OrderConfirmation';
import '@testing-library/jest-dom';

// Mock environment variables
process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY = 'test-publishable-key';
process.env.REACT_APP_API_URL = 'http://localhost:5000';

// Mock fetch for order details
const mockOrderResponse = {
  products: [
    { Product_ID: 1, Product_Name: 'Product 1', Product_Price: 100, Product_Image_URL: 'image1.jpg' },
    { Product_ID: 2, Product_Name: 'Product 2', Product_Price: 200, Product_Image_URL: 'image2.jpg' },
  ],
  order: {
    Order_ID: '12345',
    created_at: '2024-09-10T10:00:00Z',
    Order_Type: 'Delivery',
    Email: 'test@example.com',
    Mobile: '123456789',
    Street_Address: '123 Test Street',
    Total_Amount: 300,
    Product_IDs: '1:Default,2:Custom',
  },
};

describe('OrderConfirmationPage', () => {
  const clearCart = jest.fn();
  
  const renderComponent = () => {
    render(
      <CartContext.Provider value={{ cart: [], clearCart }}>
        <MemoryRouter initialEntries={['/order-confirmation?client_secret=secret_test']}>
          <Routes>
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          </Routes>
        </MemoryRouter>
      </CartContext.Provider>
    );
  };

  beforeEach(() => {
    // Mock fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();  // Clear mocks after each test
    global.fetch.mockClear();  // Clear fetch mocks after each test
  });

  test('displays loading message initially', () => {
    renderComponent();
    expect(screen.getByText('Loading payment status...')).toBeInTheDocument();
  });

  test('displays order details after successful payment', async () => {
    renderComponent();

    // Wait for successful payment status to be handled
    await waitFor(() => expect(screen.getByText('Thank you for your order!')).toBeInTheDocument());

    // Check order details display
    await waitFor(() => {
      expect(screen.getByText(/Order Number:/)).toHaveTextContent('12345');
    });
    expect(screen.getByText(/Order Date:/)).toHaveTextContent('September 10, 2024');
    expect(screen.getByText(/Order Type:/)).toHaveTextContent('Delivery');
    expect(screen.getByText(/Email:/)).toHaveTextContent('test@example.com');
    expect(screen.getByText(/Phone Number:/)).toHaveTextContent('123456789');
    expect(screen.getByText(/Delivery Address:/)).toHaveTextContent('123 Test Street');
    expect(screen.getByText(/Total Amount:/)).toHaveTextContent('$300.00');

    // Check purchased products display
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  test('displays error message when payment status retrieval fails', async () => {
    // Mock failed payment intent retrieval only within this test
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: jest.fn().mockResolvedValue({
        retrievePaymentIntent: jest.fn().mockResolvedValue({
          paymentIntent: { status: 'failed' },
        }),
      }),
    }));

    renderComponent();

    // Wait for error message
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });

  test('clears cart and navigates when continue shopping button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Thank you for your order!')).toBeInTheDocument();
   });
   
    // Click the "Continue Shopping" button
    fireEvent.click(screen.getByText('Continue Shopping'));

    // Check if the cart is cleared
    expect(clearCart).toHaveBeenCalled();

    // Check navigation - this may require additional mocks if you use useNavigate
    // You can mock `useNavigate` if needed, or check MemoryRouter history.
  });
});
