import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CartContext } from '../../src/context/CartContext';
import { MemoryRouter } from 'react-router-dom';
import OrderConfirmationPage from '../../src/pages/Checkout/OrderConfirmation';
import { loadStripe } from '@stripe/stripe-js';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({
    retrievePaymentIntent: jest.fn(),
  }),
}));

const mockClearCart = jest.fn();

const renderWithContext = (component, contextValues = { cart: [] }) => {
  return render(
    <CartContext.Provider value={{ cart: contextValues.cart, clearCart: mockClearCart }}>
      <MemoryRouter initialEntries={['/order-confirmation?client_secret=test_secret']}>
        {component}
      </MemoryRouter>
    </CartContext.Provider>
  );
};

describe('OrderConfirmationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('displays loading state initially', () => {
    renderWithContext(<OrderConfirmationPage />);
    expect(screen.getByText('Loading payment status...')).toBeInTheDocument();
  });

  test('displays order details on successful payment', async () => {
    const mockRetrievePaymentIntent = jest.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
    });

    loadStripe.mockResolvedValueOnce({
      retrievePaymentIntent: mockRetrievePaymentIntent,
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          products: [
            {
              Product_ID: 1,
              Product_Name: 'Test Product',
              Product_Price: 100,
              Product_Image_URL: 'https://example.com/image.jpg',
            },
          ],
          order: {
            Order_ID: '12345',
            created_at: '2024-10-15T12:00:00Z',
            Order_Type: 'Delivery',
            Email: 'test@example.com',
            Mobile: '1234567890',
            Street_Address: '123 Test St',
            Total_Amount: 100,
          },
        }),
      })
    );

    renderWithContext(<OrderConfirmationPage />);

    expect(await screen.findByText('Thank you for your order!')).toBeInTheDocument();
    expect(await screen.findByText('Order Number:')).toBeInTheDocument();
    expect(await screen.findByText('12345')).toBeInTheDocument();
    expect(await screen.findByText('Your payment was successful.')).toBeInTheDocument();
    expect(await screen.findByText('Total Amount:')).toBeInTheDocument();
    expect(await screen.findByText('$100')).toBeInTheDocument();
  });

  test('displays payment failed message', async () => {
    // Ensure we get a fresh instance of loadStripe and set its behavior
    const stripeInstance = await loadStripe();
    
    // Mock the retrievePaymentIntent to simulate a failed payment
    stripeInstance.retrievePaymentIntent = jest.fn().mockResolvedValue({
      paymentIntent: { status: 'requires_payment_method' },
    });
  
    // Clear previous mocks and setup the context for the component
    renderWithContext(<OrderConfirmationPage />);
  
    // Wait for the payment failed message to appear
    expect(await screen.findByText('Payment Failed')).toBeInTheDocument();
    expect(await screen.findByText('Unfortunately, your payment could not be processed. Please try again or contact support.')).toBeInTheDocument();
  });

  test('displays error message when payment status cannot be retrieved', async () => {
    const stripe = await loadStripe();
    stripe.retrievePaymentIntent = jest.fn().mockRejectedValue(new Error('Network Error'));

    renderWithContext(<OrderConfirmationPage />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("We couldn't retrieve your payment status. Please contact support.")).toBeInTheDocument();
    });
  });

  test('handles continue shopping button click', async () => {
    const stripe = await loadStripe();
    stripe.retrievePaymentIntent = jest.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          products: [],
          order: {
            Order_ID: '12345',
            created_at: '2024-10-15T12:00:00Z',
            Order_Type: 'Delivery',
            Email: 'test@example.com',
            Mobile: '1234567890',
            Street_Address: '123 Test St',
            Total_Amount: 100,
            Product_IDs: '1:Option1',
          },
        }),
      })
    );

    renderWithContext(<OrderConfirmationPage />);

    await waitFor(() => {
      expect(screen.getByText('Thank you for your order!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue Shopping'));

    expect(mockClearCart).toHaveBeenCalled();
  });
});
