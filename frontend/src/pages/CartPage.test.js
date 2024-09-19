import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from '../pages/CartPage'; // Ensure this path is correct
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
    Product_Price: '250.00',
    quantity: 2,
    selectedOption: 'Surfmist',
    Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624907/mini_standard_planter_box_neqwwl.jpg'
  }
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

describe('CartPage', () => {
  test('displays cart items and calculates total', () => {
    renderWithProvider(<CartPage />, { cart: mockCart });

    // Debug the rendered DOM to check for content
    screen.debug();

    // Check if elements are rendered correctly
    expect(screen.queryByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$250\.00/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2')).toBeInTheDocument();
    expect(screen.queryByText(/\$500\.00/)).toBeInTheDocument(); // Total price
  });

  test('handles continue shopping and checkout navigation', () => {
    const navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);

    renderWithProvider(<CartPage />);

    fireEvent.click(screen.queryByText(/Continue Shopping/i));
    expect(navigate).toHaveBeenCalledWith('/browse');

    fireEvent.click(screen.queryByText(/Checkout/i));
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  test('handles clear cart functionality', () => {
    renderWithProvider(<CartPage />, { cart: mockCart });

    fireEvent.click(screen.queryByText(/Clear Cart/i));
    expect(screen.queryByText(/Your cart is empty/i)).toBeInTheDocument();
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