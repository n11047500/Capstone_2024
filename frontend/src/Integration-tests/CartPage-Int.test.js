import React, { useState } from 'react'; // Import useState for managing state
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from '../pages/CartPage';
import { CartContext } from '../context/CartContext'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock Cart Data
const mockCart = [
  {
    Product_ID: 1,
    Product_Name: 'Mini Standard Planter Box',
    Product_Price: 250.00,
    quantity: 2,
    selectedOption: 'Surfmist',
    Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624907/mini_standard_planter_box_neqwwl.jpg',
  },
  {
    Product_ID: 2,
    Product_Name: 'Small Standard Planter Box',
    Product_Price: 265.00,
    quantity: 1,
    selectedOption: 'White',
    Product_Image_URL: 'https://example.com/product2.jpg',
  },
];

// Render function for the CartPage with the CartProvider
const renderCartPageWithProvider = (initialCart = []) => {
  const CartProviderWrapper = ({ children }) => {
    const [cart, setCart] = useState(initialCart);
    
    const clearCart = () => {
      setCart([]); // Clear the cart
    };

    const updateQuantity = (productId, selectedOption, quantity) => {
      setCart((prevCart) => {
        const updatedCart = [...prevCart];
        const productIndex = updatedCart.findIndex(
          (item) => item.Product_ID === productId && item.selectedOption === selectedOption
        );

        if (productIndex !== -1) {
          updatedCart[productIndex].quantity = quantity;
        }

        return updatedCart;
      });
    };

    const removeFromCart = (productId, selectedOption) => { 
      setCart((prevCart) =>
        prevCart.filter(
          (item) => item.Product_ID !== productId || item.selectedOption !== selectedOption
        )
      );
    };

    return (
      <CartContext.Provider value={{ cart, clearCart, updateQuantity, removeFromCart }}>
        {children}
      </CartContext.Provider>
    );
  };

  return render(
    <MemoryRouter>
      <CartProviderWrapper>
        <CartPage />
      </CartProviderWrapper>
    </MemoryRouter>
  );
};

describe('CartPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks before each test
  });

  // ensures all cart items and the cart total display as expected on the CartPage
  test('should display cart items and calculate total correctly', () => {
    renderCartPageWithProvider(mockCart);
  
    // Check for the product names
    expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
    expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
  
    // Check the prices
    const price250Elements = screen.queryAllByText(/\$250\.00/);
    expect(price250Elements.length).toBeGreaterThanOrEqual(1); // Check at least one instance of $250.00
  
    const price150Elements = screen.queryAllByText(/\$265\.00/);
    expect(price150Elements.length).toBeGreaterThanOrEqual(1); // Check at least one instance of $150.00
  
    // Check the quantities
    const quantityInputs = screen.getAllByLabelText('Quantity'); // Get all inputs with label 'Quantity'
    
    // Check the first product quantity
    expect(quantityInputs[0].value).toBe('2'); // Check that the first input value is '2'
    
    // Check the second product quantity (assuming there are only two products)
    expect(quantityInputs[1].value).toBe('1'); // Check that the second product input value is '1'
  
    // Check the total price
    expect(screen.getByText(/Subtotal:\s*\$765\.00/)).toBeInTheDocument(); // Use a regex to match the subtotal
  });
  
  //esnures users can update the quantity input of items in the cart
  test('Updates item quantity correctly', () => {
    renderCartPageWithProvider(mockCart);
  
    // Find the quantity input for the first product
    const quantityInput = screen.getAllByLabelText('Quantity')[0];
  
    // Change the quantity to 3
    fireEvent.change(quantityInput, { target: { value: '3' } });
  
    // Check if the quantity input value is updated
    expect(quantityInput.value).toBe('3');
  
    // Check if the total price is updated
    expect(screen.getByText(/Subtotal:\s*\$1,015\.00/)).toBeInTheDocument(); // Adjust based on your total calculation logic
  });



  test('Navigates to checkout page', () => {
    const navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);
  
    // Ensure the cart has at least one item
    const mockCart = [
      {
        Product_ID: 1,
        Product_Name: 'Test Product',
        selectedOption: 'Option 1',
        Product_Price: 100,
        quantity: 1,
      },
    ];
  
    // Render CartPage with the mock cart containing items
    renderCartPageWithProvider(mockCart); // Use the defined mockCart
  
    // Find the Checkout button and check if it's enabled
    const checkoutButton = screen.getByText(/Checkout/i);
    expect(checkoutButton).not.toBeDisabled(); // Check that the button is enabled
  
    // Click the Checkout button
    fireEvent.click(checkoutButton);
  
    // Assert that the navigate function was called with '/checkout'
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  test('Removes item from cart', () => {
    // Render the cart page with the initial mock cart
    const { container } = renderCartPageWithProvider(mockCart);
  
    // Debug the current output
    screen.debug(); // This will log the rendered output in the terminal
  
    // Get all remove buttons
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
  
    // Click the remove button for the first product (Mini Standard Planter Box)
    fireEvent.click(removeButtons[0]);
  
    // Check if the first product was removed and the second product remains
    expect(screen.queryByText(/Mini Standard Planter Box/i)).not.toBeInTheDocument(); // Ensure it is removed
    expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument(); // Ensure the other product is still there
    expect(screen.getByText(/Subtotal: \$265.00/i)).toBeInTheDocument(); // Ensure the subtotal reflects the remaining product
  });

  // test ensures when user hits 'clear cart' button that the cart total is reset to 0 and the cart is enmpty
  test('handles clear cart functionality', async () => {
    const { getByText, queryByText } = renderCartPageWithProvider(mockCart);

    // Check initial items are displayed
    expect(getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
    expect(getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
    expect(getByText(/Subtotal: \$1,015\.00/i)).toBeInTheDocument(); // Adjust based on your total calculation logic

    // Click the Clear Cart button
    fireEvent.click(getByText(/Clear Cart/i));

    // Use waitFor to check for empty cart messages
    await waitFor(() => {
      expect(queryByText(/Your cart is empty/i)).toBeInTheDocument();
      expect(queryByText(/Subtotal: \$0\.00/i)).toBeInTheDocument();
    });
  });
  
  // From the cart page users can navigate back to the browse page by hitting the 'Continue Shopping' button
  test('navigates to continue shopping page', () => {
    const navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);
    
    // Use an empty mock cart to avoid undefined issues
    const mockCart = []; 
    renderCartPageWithProvider(mockCart);
    
    fireEvent.click(screen.getByText(/Continue Shopping/i));
    expect(navigate).toHaveBeenCalledWith('/browse');
  });
  
  
  test('Disables checkout button when cart is empty', () => {
    renderCartPageWithProvider([]);

    const checkoutButton = screen.getByText(/Checkout/i);
    expect(checkoutButton).toBeDisabled();
  });
});

