// OrderConfirmationPage.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderConfirmationPage from '../../src/pages/Checkout/OrderConfirmation'; // Adjust the import path as needed
import { CartContext } from '../../src/context/CartContext';

const mockClearCart = jest.fn();

const MockCartProvider = ({ children }) => {
  return (
    <CartContext.Provider value={{ clearCart: mockClearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Mocking react-router-dom's useNavigate at the top
jest.mock('react-router-dom', () => {
  const actualRouter = jest.requireActual('react-router-dom');
  return {
    ...actualRouter,
    useNavigate: jest.fn(), // Create a mock function here
  };
});

const navigate = require('react-router-dom').useNavigate; // Import the mocked useNavigate

describe('OrderConfirmationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <MockCartProvider>
          <OrderConfirmationPage />
        </MockCartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading payment status/i)).toBeInTheDocument();
  });

  it('renders success state when payment is successful', async () => {
    // Mocking the fetch and loadStripe
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        products: [
          {
            Product_ID: '1',
            Product_Name: 'Test Product 1',
            Product_Image_URL: 'http://example.com/image1.jpg',
            Product_Price: 100,
          },
        ],
        order: {
          Order_ID: '12345',
          created_at: '2024-10-01T00:00:00Z',
          Order_Type: 'Delivery',
          Email: 'test@example.com',
          Mobile: '1234567890',
          Total_Amount: 100,
          Street_Address: '123 Test St',
          Product_IDs: '1:Default',
        },
      }),
    });

    global.fetch = mockFetch;

    // Mocking loadStripe to return a resolved promise
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: jest.fn().mockResolvedValue({
        retrievePaymentIntent: jest.fn().mockResolvedValue({
          paymentIntent: { status: 'succeeded' },
        }),
      }),
    }));

    render(
      <MemoryRouter initialEntries={['/order-confirmation?client_secret=test_secret']}>
        <MockCartProvider>
          <OrderConfirmationPage />
        </MockCartProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/thank you for your order/i)).toBeInTheDocument());

    expect(screen.getByText(/order number/i)).toHaveTextContent('12345');
    expect(screen.getByText(/test product 1/i)).toBeInTheDocument();
    expect(screen.getByText(/total amount/i)).toHaveTextContent('$100.00');
  });

  it('renders error state when payment retrieval fails', async () => {
    // Mocking the fetch and loadStripe to simulate error
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ error: 'Payment error' }),
    });
    
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: jest.fn().mockResolvedValue({
        retrievePaymentIntent: jest.fn().mockResolvedValue({
          paymentIntent: { status: 'error' },
        }),
      }),
    }));

    render(
      <MemoryRouter initialEntries={['/order-confirmation?client_secret=test_secret']}>
        <MockCartProvider>
          <OrderConfirmationPage />
        </MockCartProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument());
  });

  it('renders failed state when payment fails', async () => {
    // Mocking the fetch and loadStripe to simulate failure
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: jest.fn().mockResolvedValue({
        retrievePaymentIntent: jest.fn().mockResolvedValue({
          paymentIntent: { status: 'requires_payment_method' },
        }),
      }),
    }));

    render(
      <MemoryRouter initialEntries={['/order-confirmation?client_secret=test_secret']}>
        <MockCartProvider>
          <OrderConfirmationPage />
        </MockCartProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/payment failed/i)).toBeInTheDocument());
  });

  it('clears cart and navigates when continue shopping button is clicked', async () => {
    // Mocking successful payment scenario again for testing continue shopping
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        products: [],
        order: {},
      }),
    });

    render(
      <MemoryRouter initialEntries={['/order-confirmation?client_secret=test_secret']}>
        <MockCartProvider>
          <OrderConfirmationPage />
        </MockCartProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/thank you for your order/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/continue shopping/i));

    expect(mockClearCart).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/browse');
  });
});
