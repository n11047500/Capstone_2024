import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from './CartPage'; // Ensure this path is correct
import { CartProvider } from '../context/CartContext'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockCart = [
  {
    Product_ID: 1,
    Product_Name: 'Mini Standard Planter Box',
    Product_Price: 250.00,
    quantity: 2,
    selectedOption: 'Surfmist',
    Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624907/mini_standard_planter_box_neqwwl.jpg',
  },
];

const renderWithProvider = (ui, { cart = [] } = {}) => {
  return render(
    <MemoryRouter>
      <CartProvider value={{ cart }}>
        {ui}
      </CartProvider>
    </MemoryRouter>
  );
};

describe('CartPage Integration Tests', () => {
  test('displays cart items and calculates total correctly', () => {
    renderWithProvider(<CartPage />, { cart: mockCart });

    expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
    expect(screen.getByText(/\$250\.00/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument(); // Total price
  });

  test('Updates item quantity correctly', () => {
    renderWithProvider(<CartPage />, { cart: mockCart });

    const quantityInput = screen.getByDisplayValue('2');
    fireEvent.change(quantityInput, { target: { value: '3' } });

    // Assuming updateQuantity is properly updating context state
    expect(quantityInput.value).toBe('3'); // Ensure input reflects the change
    expect(screen.getByText(/\$750\.00/)).toBeInTheDocument(); // New total price
  });

  test('Removes item from cart', () => {
    renderWithProvider(<CartPage />, { cart: mockCart });

    fireEvent.click(screen.getByRole('button', { name: /✖/i }));

    // Check if the cart is empty
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  test('handles clear cart functionality', () => {
    renderWithProvider(<CartPage />, { cart: mockCart });

    fireEvent.click(screen.getByText(/Clear Cart/i));

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  test('navigates to continue shopping page', () => {
    const navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);

    renderWithProvider(<CartPage />);

    fireEvent.click(screen.getByText(/Continue Shopping/i));
    expect(navigate).toHaveBeenCalledWith('/browse');
  });

  test('Navigates to checkout page', () => {
    const navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);

    renderWithProvider(<CartPage />);

    fireEvent.click(screen.getByText(/Checkout/i));
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  test('Disables checkout button when cart is empty', () => {
    renderWithProvider(<CartPage />, { cart: [] });

    const checkoutButton = screen.getByText(/Checkout/i);
    expect(checkoutButton).toBeDisabled();
  });
});

// describe('CartPage', () => {
//   test('displays cart items and calculates total', () => {
//     renderWithProvider(<CartPage />, { cart: mockCart });

//     // Debug the rendered DOM
//     screen.debug();

//     // Check if elements are rendered correctly
//     const productNameElement = screen.queryByText(/Mini Standard Planter Box/i);
//     expect(productNameElement).toBeInTheDocument();

//     const productPriceElement = screen.queryByText(/\$250\.00/);
//     expect(productPriceElement).toBeInTheDocument();

//     const quantityInputElement = screen.queryByDisplayValue('2');
//     expect(quantityInputElement).toBeInTheDocument();

//     const totalPriceElement = screen.queryByText(/\$500\.00/);
//     expect(totalPriceElement).toBeInTheDocument();
//   });