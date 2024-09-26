import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CartContext } from '../src/context/CartContext';
import ProductPage from '../src/pages/ProductPage'; 

// Mock the CartContext
const mockAddToCart = jest.fn();

const renderWithContext = (ui, { providerProps = {}, ...renderOptions } = {}) => {
    return render(
      <CartContext.Provider value={{ addToCart: mockAddToCart, cart: [] }} {...providerProps}>
        <MemoryRouter initialEntries={['/products/1']}>
          <Routes>
            <Route path="/products/:productId" element={ui} />
          </Routes>
        </MemoryRouter>
      </CartContext.Provider>,
      renderOptions
    );
  };

describe('ProductPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mock calls before each test
  });

  beforeAll(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });  

  test('renders loading state initially', () => {
    renderWithContext(<ProductPage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('renders product details after fetching', async () => {
    // Mock fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            Product_Name: 'Test Product',
            Description: 'This is a test.',
            Product_Dimensions: '10x10x10',
            Product_Price: 99.99,
            averageRating: 4.5,
            Product_Options: 'Option1,Option2',
            reviewCount: 10,
            Product_Image_URL: null,
          }),
      })
    );

    renderWithContext(<ProductPage />);

    expect(await screen.findByText(/Test Product/i)).toBeInTheDocument();
    expect(await screen.findByText(/This is a test./i)).toBeInTheDocument();
    expect(await screen.findByText(/Dimensions:/i)).toBeInTheDocument();
    expect(await screen.findByText(/\$99.99/i)).toBeInTheDocument();
    expect(await screen.findByText(/4.50/i)).toBeInTheDocument();
  });

  test('handles add to cart with no option selected', async () => {
    // Mock the fetch response to return a product with options
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            Product_Name: 'Test Product',
            Product_Options: ['Option1', 'Option2'],
          }),
      })
    );
  
    // Spy on the alert function to assert later if it was called
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  
    // Render the ProductPage component
    renderWithContext(<ProductPage />);
  
    // Wait for the product details to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    });
  
    // Simulate the user NOT selecting an option from the dropdown
    const button = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(button);
  
    // Assert that the alert is triggered and addToCart is NOT called
    expect(window.alert).toHaveBeenCalledWith('Please select an option');
    expect(mockAddToCart).not.toHaveBeenCalled();
  });
  
  
  test('adds product to cart with selected option', async () => {
    // Mock the fetch response to return a product with options
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            Product_Name: 'Test Product',
            Product_Options: 'Option1,Option2',
          }),
      })
    );
  
    renderWithContext(<ProductPage />);
  
    // Wait for the product details to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    });
  
    // Now look for the combobox (select element)
    const select = screen.getByRole('combobox'); // Make sure this matches the rendered output
    fireEvent.change(select, { target: { value: 'Option1' } });
    
    const button = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(button);
  
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        Product_Name: 'Test Product',
        selectedOption: 'Option1',
      }),
      1
    );
  });
});