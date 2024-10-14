// PaymentForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StripeProvider, Elements } from '@stripe/react-stripe-js';
import { MemoryRouter } from 'react-router-dom';
import PaymentForm from '../../src/pages/Checkout/PaymentForm';
import { CartContext } from '../../src/context/CartContext';

// Mocking the context and API calls
const mockClearCart = jest.fn();
const mockCartContextValue = { clearCart: mockClearCart };

// Mocking Stripe's createPaymentMethod and confirmCardPayment methods
const mockStripe = {
  createPaymentMethod: jest.fn(),
  confirmCardPayment: jest.fn(),
};

jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => mockStripe,
  useElements: () => ({
    getElement: jest.fn().mockReturnValue({
      // Mocking CardElement behavior
    }),
  }),
}));

// Test component wrapped in necessary providers
const renderPaymentForm = (data, handleBack = jest.fn()) => {
  return render(
    <CartContext.Provider value={mockCartContextValue}>
      <MemoryRouter>
        <StripeProvider apiKey="test">
          <Elements>
            <PaymentForm data={data} onBack={handleBack} onChange={jest.fn()} />
          </Elements>
        </StripeProvider>
      </MemoryRouter>
    </CartContext.Provider>
  );
};

describe('PaymentForm', () => {
  const mockData = {
    totalAmount: '100.00',
    cart: [{ Product_ID: '123', quantity: 1 }],
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Test St',
    },
    shippingMethod: {
      shippingOption: 'Standard Shipping',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks before each test
  });

  test('renders payment form correctly', () => {
    renderPaymentForm(mockData);
    expect(screen.getByText(/Payment Method/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  test('submits form with valid payment information', async () => {
    mockStripe.createPaymentMethod.mockResolvedValueOnce({
      paymentMethod: { id: 'mockPaymentMethodId' },
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ id: 'order123', client_secret: 'secret123' }),
    });

    renderPaymentForm(mockData);

    // Simulate filling out the form and submitting
    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

    await waitFor(() => {
      expect(mockStripe.createPaymentMethod).toHaveBeenCalled();
      expect(mockClearCart).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/orders', expect.any(Object));
    });
  });

  test('shows error message on payment failure', async () => {
    mockStripe.createPaymentMethod.mockResolvedValueOnce({ error: { message: 'Payment failed' } });
    renderPaymentForm(mockData);

    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

    await waitFor(() => {
      expect(screen.getByText(/Payment failed/i)).toBeInTheDocument();
    });
  });

  test('handles back button click', () => {
    const handleBack = jest.fn();
    renderPaymentForm(mockData, handleBack);

    fireEvent.click(screen.getByRole('button', { name: /Back/i }));

    expect(handleBack).toHaveBeenCalled(); // Check if back function was called
  });

  test('handles invalid total amount', async () => {
    const invalidData = { ...mockData, totalAmount: 'invalid' };
    renderPaymentForm(invalidData);

    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid total amount/i)).toBeInTheDocument();
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test for better isolation
  });
});
