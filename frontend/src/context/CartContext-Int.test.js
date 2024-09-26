import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, CartContext } from './CartContext'; // Ensure this path is correct
import '@testing-library/jest-dom/extend-expect';
// Create a TestComponent to interact with the CartContext
const TestComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = React.useContext(CartContext);

  return (
    <div>
      <button onClick={() => addToCart({ Product_ID: 1, Product_Name: 'Test Product', Product_Price: '5.00', selectedOption: '' }, 1)}>Add to Cart</button>
      <button onClick={() => updateQuantity(1, '', 2)}>Update Quantity</button>
      <button onClick={() => removeFromCart(1, '')}>Remove from Cart</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
      <div data-testid="cart">{JSON.stringify(cart)}</div>
    </div>
  );
};

describe('Cart Context Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('Adds an item to the cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Act: Trigger the action to add an item to the cart
    act(() => {
      screen.getByText(/Add to Cart/i).click();
    });

    // Assert: Verify the cart contains the added item
    expect(screen.getByTestId('cart')).toHaveTextContent('Test Product');
  });

  test('Update item quantity in the cart', () => {
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

  test('Removes an item from the cart', () => {
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

    // Assert: Verify the cart is empty
    expect(screen.getByTestId('cart')).toHaveTextContent('[]');
  });

  test('Clear the cart', () => {
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

    // Assert: Verify the cart is empty
    expect(screen.getByTestId('cart')).toHaveTextContent('[]');
  });
});
