// PaymentForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import PaymentForm from '../../src/pages/Checkout/PaymentForm';
import { MemoryRouter } from 'react-router-dom'; import { CartContext } from '../../src/context/CartContext'; // Your CartContext import

// Mocking CartContext for the test
const mockClearCart = jest.fn();

// Mock the required hooks and methods
jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: jest.fn(),
  useElements: jest.fn(),
  CardElement: () => <div data-testid="stripe-card-element">Card Element</div>,
}));

const mockStripe = {
  createPaymentMethod: jest.fn(),
  confirmCardPayment: jest.fn(),
};

const mockElements = {
  getElement: jest.fn(),
};

// Mocking CartContext provider
const renderWithContext = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <MemoryRouter>
      <CartContext.Provider value={{ clearCart: mockClearCart }}>
        {ui}
      </CartContext.Provider>
    </MemoryRouter>,
    renderOptions
  );
};


describe('PaymentForm', () => {
  beforeEach(() => {
    useStripe.mockReturnValue(mockStripe);
    useElements.mockReturnValue(mockElements);
    mockElements.getElement.mockReturnValue({}); // Mock CardElement
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  test('renders the PaymentForm correctly', () => {
    renderWithContext(<PaymentForm data={{}} onBack={jest.fn()} onChange={jest.fn()} />, {
      providerProps: { clearCart: mockClearCart },
    });

    expect(screen.getByText(/Payment Method/i)).toBeInTheDocument();
    expect(screen.getByTestId('stripe-card-element')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay/i })).toBeInTheDocument();
  });

  test('handles successful payment submission', async () => {
    const mockData = {
      totalAmount: 100,
      cart: [{ Product_ID: '1', quantity: 2, selectedOption: 'option1' }],
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St',
      },
      shippingMethod: {
        shippingOption: 'Standard Shipping',
      },
    };

    mockStripe.createPaymentMethod.mockResolvedValue({ paymentMethod: { id: 'paymentMethodId' } });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 'orderId', client_secret: 'clientSecret' }),
    });

    renderWithContext(<PaymentForm data={mockData} onBack={jest.fn()} onChange={jest.fn()} />, {
      providerProps: { clearCart: mockClearCart },
    });

    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

    await waitFor(() => expect(mockStripe.createPaymentMethod).toHaveBeenCalled());
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/api/orders`, expect.any(Object)));
    await waitFor(() => expect(mockClearCart).toHaveBeenCalled());
    expect(await screen.findByText(/Payment is processed securely using Stripe/i)).toBeInTheDocument();
  });
  test('shows an error when payment fails', async () => {

    const mockData = {
      totalAmount: 100, // Adjust according to your component's needs
    };
    const mockStripe = {
      createPaymentMethod: jest.fn().mockResolvedValue({
        error: { message: 'Payment failed' }, // Simulate payment failure
        paymentMethod: null,
      }),
    };

    useStripe.mockReturnValue(mockStripe);

    renderWithContext(<PaymentForm data={mockData} onBack={jest.fn()} onChange={jest.fn()} />, {
      providerProps: { clearCart: jest.fn() }, // Adjust as needed
    });

    // Trigger the form submission
    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Payment failed/i);
    });
  });
});
