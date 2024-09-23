// Browse.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Browse from '../src/pages/Browse'; 
import { CartContext } from '../src/context/CartContext';

// Mock CartContext values
const mockCartContextValue = {
  cart: [], // Initial cart state
  // Add other properties/methods as needed for your tests
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
        {ui}
      </CartContext.Provider>
    );
  };

  test('renders the component and fetches products', async () => {
    renderWithCartProvider(<Browse />);

    expect(screen.getByText(/Browse/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Product A')).toBeInTheDocument();
      expect(screen.getByText('Test Product B')).toBeInTheDocument();
    });
  });

  test('handles search functionality', async () => {
    renderWithCartProvider(<Browse />);

    await waitFor(() => expect(screen.getByText('Test Product A')).toBeInTheDocument());

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Test Product A' } });

    await waitFor(() => expect(screen.getByText('Test Product A')).toBeInTheDocument());
    expect(screen.queryByText('Test Product B')).not.toBeInTheDocument();
  });

  test('sorts products by price ascending', async () => {
    renderWithCartProvider(<Browse />);

    await waitFor(() => expect(screen.getByText('Test Product A')).toBeInTheDocument());

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'priceAsc' } });

    const productCards = screen.getAllByRole('article'); // Assuming ProductCard uses 'article' role
    expect(productCards[0]).toHaveTextContent('Test Product B');
    expect(productCards[1]).toHaveTextContent('Test Product A');
  });

  test('sorts products by name descending', async () => {
    renderWithCartProvider(<Browse />);

    await waitFor(() => expect(screen.getByText('Test Product A')).toBeInTheDocument());

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'nameDesc' } });

    const productCards = screen.getAllByRole('article'); // Assuming ProductCard uses 'article' role
    expect(productCards[0]).toHaveTextContent('Test Product B');
    expect(productCards[1]).toHaveTextContent('Test Product A');
  });
});
