// Browse.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import Browse from '../src/pages/Browse';
import { CartContext } from '../src/context/CartContext';

// Mock CartContext values
const mockCartContextValue = {
  cart: [],
  addToCart: jest.fn(), // Mock addToCart function
  removeFromCart: jest.fn(), // Mock removeFromCart function
};

describe('Browse Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { Product_ID: 1, Product_Name: 'Test Product A', Product_Price: '50.00', Product_Image_URL: '' },
            { Product_ID: 2, Product_Name: 'Test Product B', Product_Price: '30.00', Product_Image_URL: '' },
          ]),
        });
      }
      if (url.includes('/api/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { Product_ID: 1, Product_Name: 'Test Product A', Product_Price: '50.00', Product_Image_URL: '' },
          ]),
        });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithCartProvider = (ui) => {
    return render(
      <CartContext.Provider value={mockCartContextValue}>
        <BrowserRouter>{ui}</BrowserRouter> {/* Wrap in BrowserRouter */}
      </CartContext.Provider>
    );
  };

  test('renders the component and fetches products', async () => {
    renderWithCartProvider(<Browse />);

    // Check for the presence of the Browse header and the dropdown (combobox)
    expect(screen.getByText(/Browse/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // Wait for the products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product A')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Product B')).toBeInTheDocument();
    });
  });

  test('handles search functionality', async () => {
    renderWithCartProvider(<Browse />);

    // Simulate typing in the search box
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'Test Product A' },
    });

    // Simulate clicking the search icon or pressing enter
    fireEvent.click(screen.getByTestId('search-icon'));

    // Assert that only Test Product A is shown
    await waitFor(() => {
      expect(screen.getByText('Test Product A')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Product B')).not.toBeInTheDocument();
    });
  });

  test('sorts products by price ascending', async () => {
    renderWithCartProvider(<Browse />);

    // Wait for products to be fetched
    expect(await screen.findByText('Test Product A')).toBeInTheDocument();

    // Simulate selecting the priceAsc option from the dropdown
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'priceAsc' } });

    // Wait for products to re-render after sorting
    const productCards = await screen.findAllByRole('article'); // Use findAllByRole to wait for elements

    // Check their order (assuming Product B has a lower price)
    expect(productCards[0]).toHaveTextContent('Test Product B'); // B should come first
    expect(productCards[1]).toHaveTextContent('Test Product A');
  });

  test('sorts products by name descending', async () => {
    renderWithCartProvider(<Browse />);

    // Wait for products to be fetched
    expect(await screen.findByText('Test Product A')).toBeInTheDocument();

    // Simulate selecting the nameDesc option from the dropdown
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'nameDesc' } });

    // Wait for products to re-render after sorting
    const productCards = await screen.findAllByRole('article'); // Use findAllByRole to wait for elements

    // Verify that products are sorted by name descending
    expect(productCards[0]).toHaveTextContent('Test Product B'); // B comes before A
    expect(productCards[1]).toHaveTextContent('Test Product A');
  });
});
