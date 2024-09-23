// CartPage.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartContext } from '../src/context/CartContext';
import CartPage from '../src/pages/CartPage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockCart = [
  {
    Product_ID: 1,
    Product_Name: 'Test Product',
    Product_Price: 100,
    quantity: 2,
    Product_Image_URL: 'http://example.com/image.jpg',
    selectedOption: 'Option 1',
  },
];

const mockRemoveFromCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockClearCart = jest.fn();

const renderCartPage = (cart = mockCart) => {
    return render(
      <MemoryRouter initialEntries={['/cart']}>
        <CartContext.Provider value={{ cart, removeFromCart: mockRemoveFromCart, updateQuantity: mockUpdateQuantity, clearCart: mockClearCart }}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<div>Checkout Page</div>} />
            <Route path="/browse" element={<div>Browse Page</div>} />
          </Routes>
        </CartContext.Provider>
      </MemoryRouter>
    );
  };
describe('CartPage', () => {
  test('renders the cart page with items', () => {
    renderCartPage();
    
    expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    
    // Check for total price by querying the specific table cell
    expect(screen.getByRole('cell', { name: '$200.00' })).toBeInTheDocument(); // Total Price

    // Check for subtotal by using the specific text
    expect(screen.getByText(/Subtotal:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$200.00/i, { selector: 'p' })).toBeInTheDocument(); // Subtotal
});

  test('displays "Your cart is empty" when cart is empty', () => {
    renderCartPage([]); // Pass an empty cart
    
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  test('handles checkout navigation', () => {
    renderCartPage();
    
    const checkoutButton = screen.getByText(/Checkout/i);
    fireEvent.click(checkoutButton);
    
    // Assert that we are now on the checkout page
    expect(screen.getByText(/Checkout Page/i)).toBeInTheDocument();
  });

  test('handles continue shopping navigation', () => {
    renderCartPage();
    
    const continueShoppingButton = screen.getByText(/Continue Shopping/i);
    fireEvent.click(continueShoppingButton);
    
    // Assert that we are now on the browse page
    expect(screen.getByText(/Browse Page/i)).toBeInTheDocument();
  });
  
  test('calls removeFromCart when remove button is clicked', () => {
    renderCartPage();
    
    const removeButton = screen.getByText(/✖/i);
    fireEvent.click(removeButton);
    
    expect(mockRemoveFromCart).toHaveBeenCalledWith(1, 'Option 1');
  });

  test('calls clearCart when clear cart button is clicked', () => {
    renderCartPage();
    
    const clearCartButton = screen.getByText(/Clear Cart/i);
    fireEvent.click(clearCartButton);
    
    expect(mockClearCart).toHaveBeenCalled();
  });

  test('updates quantity when quantity input changes', () => {
    renderCartPage();
    
    const quantityInput = screen.getByDisplayValue('2');
    fireEvent.change(quantityInput, { target: { value: '3' } });
    
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 'Option 1', 3);
  });
});
