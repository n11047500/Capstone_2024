import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex(
        (item) =>
          item.Product_ID === product.Product_ID && item.selectedOption === product.selectedOption
      );

      if (existingProductIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId, selectedOption) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => item.Product_ID !== productId || item.selectedOption !== selectedOption
      )
    );
  };

  const updateQuantity = (productId, selectedOption, quantity) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      const productIndex = updatedCart.findIndex(
        (item) => item.Product_ID === productId && item.selectedOption === selectedOption
      );
  
      if (productIndex !== -1) {
        // Ensure the quantity is always 1 or more
        updatedCart[productIndex].quantity = Math.max(1, quantity);
      }
  
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart'); // Remove cart from localStorage when cleared
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
