import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, CartContext } from '../context/CartContext'; // Ensure this path is correct
import '@testing-library/jest-dom/extend-expect';

const TestComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = React.useContext(CartContext);

  return (
    <div>
      <button onClick={() => addToCart({ Product_ID: 1, Product_Name: 'Test Product', Product_Price: '5.00', selectedOption: '', Product_Image_URL: '' }, 1)}>Add to Cart</button>
      <button onClick={() => updateQuantity(1, '', 2)}>Update Quantity</button>
      <button onClick={() => removeFromCart(1, '')}>Remove from Cart</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
      <div data-testid="cart">{JSON.stringify(cart)}</div>
    </div>
  );
};

describe('CartContext', () => {
  test('adds item to cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Act: Trigger the action
    act(() => {
      screen.getByText(/Add to Cart/i).click();
    });

    // Assert: Verify the cart contains the item
    expect(screen.getByTestId('cart')).toHaveTextContent('Test Product');
  });

  test('updates item quantity', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Act: Add item to cart and then update its quantity
    act(() => {
      screen.getByText(/Add to Cart/i).click();
      screen.getByText(/Update Quantity/i).click();
    });

    // Assert: Verify the updated quantity
    expect(screen.getByTestId('cart')).toHaveTextContent('2');
  });

  test('removes item from cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Act: Add item to cart and then remove it
    act(() => {
      screen.getByText(/Add to Cart/i).click();
      screen.getByText(/Remove from Cart/i).click();
    });

    // Assert: Verify the cart is empty (represented as '[]')
    expect(screen.getByTestId('cart')).toHaveTextContent('[]');
  });

  test('clears the cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Act: Add item to cart and then clear the cart
    act(() => {
      screen.getByText(/Add to Cart/i).click();
      screen.getByText(/Clear Cart/i).click();
    });

    // Assert: Verify the cart is empty (represented as '[]')
    expect(screen.getByTestId('cart')).toHaveTextContent('[]');
  });
});