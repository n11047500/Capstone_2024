import React from 'react';
import { render, act } from '@testing-library/react';
import { CartProvider, CartContext } from '../../src/context/CartContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CartProvider', () => {
  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  test('loads cart from localStorage', () => {
    // Arrange: Set initial cart in localStorage
    const savedCart = [{ Product_ID: 1, selectedOption: 'Option 1', quantity: 2 }];
    localStorage.setItem('cart', JSON.stringify(savedCart));

    // Act: Render the CartProvider
    let cart;
    render(
      <CartProvider>
        <CartContext.Consumer>
          {(value) => {
            cart = value.cart;
            return null;
          }}
        </CartContext.Consumer>
      </CartProvider>
    );

    // Assert: Check if cart is loaded from localStorage
    expect(cart).toEqual(savedCart);
  });

  test('adds a product to the cart', () => {
    let cart;
    let addToCart;

    render(
      <CartProvider>
        <CartContext.Consumer>
          {(value) => {
            cart = value.cart;
            addToCart = value.addToCart;
            return null;
          }}
        </CartContext.Consumer>
      </CartProvider>
    );

    act(() => {
      addToCart({ Product_ID: 1, selectedOption: 'Option 1' }, 2);
    });

    // Assert: Check if the product is added to the cart
    expect(cart).toEqual([{ Product_ID: 1, selectedOption: 'Option 1', quantity: 2 }]);
  });

  test('updates the quantity of an existing product in the cart', () => {
    let cart;
    let addToCart;

    render(
      <CartProvider>
        <CartContext.Consumer>
          {(value) => {
            cart = value.cart;
            addToCart = value.addToCart;
            return null;
          }}
        </CartContext.Consumer>
      </CartProvider>
    );

    act(() => {
      addToCart({ Product_ID: 1, selectedOption: 'Option 1' }, 2);
      addToCart({ Product_ID: 1, selectedOption: 'Option 1' }, 3);
    });

    // Assert: Check if the quantity is updated
    expect(cart).toEqual([{ Product_ID: 1, selectedOption: 'Option 1', quantity: 5 }]);
  });

  test('removes a product from the cart', () => {
    let cart;
    let addToCart;
    let removeFromCart;

    render(
      <CartProvider>
        <CartContext.Consumer>
          {(value) => {
            cart = value.cart;
            addToCart = value.addToCart;
            removeFromCart = value.removeFromCart;
            return null;
          }}
        </CartContext.Consumer>
      </CartProvider>
    );

    act(() => {
      addToCart({ Product_ID: 1, selectedOption: 'Option 1' }, 2);
      removeFromCart(1, 'Option 1');
    });

    // Assert: Check if the product is removed
    expect(cart).toEqual([]);
  });

  test('updates the quantity of a product in the cart', () => {
    let cart;
    let addToCart;
    let updateQuantity;

    render(
      <CartProvider>
        <CartContext.Consumer>
          {(value) => {
            cart = value.cart;
            addToCart = value.addToCart;
            updateQuantity = value.updateQuantity;
            return null;
          }}
        </CartContext.Consumer>
      </CartProvider>
    );

    act(() => {
      addToCart({ Product_ID: 1, selectedOption: 'Option 1' }, 2);
      updateQuantity(1, 'Option 1', 5);
    });

    // Assert: Check if the quantity is updated
    expect(cart).toEqual([{ Product_ID: 1, selectedOption: 'Option 1', quantity: 5 }]);
  });

  test('clears the cart', () => {
    let cart;
    let addToCart;
    let clearCart;
  
    render(
      <CartProvider>
        <CartContext.Consumer>
          {(value) => {
            cart = value.cart;
            addToCart = value.addToCart;
            clearCart = value.clearCart;
            return null;
          }}
        </CartContext.Consumer>
      </CartProvider>
    );
  
    act(() => {
      addToCart({ Product_ID: 1, selectedOption: 'Option 1' }, 2);
      clearCart();
    });
  
    // Assert: Check if the cart is cleared
    expect(cart).toEqual([]);
  });
});
