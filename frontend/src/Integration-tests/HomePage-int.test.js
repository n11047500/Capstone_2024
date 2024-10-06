import React from 'react';  
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage'; // Adjust this to the correct path
import ProductPage from '../pages/ProductPage'; // Mock the product page component for navigation test
import { CartContext } from '../context/CartContext'; // Adjust path as needed
import { BrowserRouter as Router } from 'react-router-dom';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          Product_ID: 1,
          Product_Name: 'Apple',
          Product_Price: 100,
          Product_Image_URL: 'https://example.com/apple.jpg',
        },
        {
          Product_ID: 2,
          Product_Name: 'Banana',
          Product_Price: 50,
          Product_Image_URL: 'https://example.com/banana.jpg',
        },
        {
          Product_ID: 3,
          Product_Name: 'Cherry',
          Product_Price: 150,
          Product_Image_URL: 'https://example.com/cherry.jpg',
        },
      ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks(); // Clear the mock after each test
});

describe('Home Page Integration Tests', () => {
  const renderWithContext = () => {
    return render(
      <Router>
        <CartContext.Provider value={{ addToCart: jest.fn(), cart: [] }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
        </CartContext.Provider>
      </Router>
    );
  };

  test('renders and changes slides', async () => {
    renderWithContext();

    // Check that the first slide is displayed
    expect(screen.getByText('The pain-free gardening solution suitable for everybody.')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument(); // previous button
    expect(screen.getByText('→')).toBeInTheDocument(); // next button
  
    // Simulate clicking the next button
    fireEvent.click(screen.getByText('→'));
  
    // Wait for the second slide content to appear
    await waitFor(() => {
      expect(screen.getByText('Order Customised Ezee Planter Box')).toBeInTheDocument();
    });
  
    // Simulate clicking the previous button
    fireEvent.click(screen.getByText('←'));
  
    // Wait for the first slide content to reappear
    await waitFor(() => {
      expect(screen.getByText('The pain-free gardening solution suitable for everybody.')).toBeInTheDocument();
    });
  });

  test('renders featured products after fetch', async () => {
    renderWithContext();

    // Check if the products rendered correctly
    await waitFor(() => {
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
      expect(screen.getByText(/Banana/i)).toBeInTheDocument();
      expect(screen.getByText(/Cherry/i)).toBeInTheDocument();
    });
  });

  test('navigates to product page on product click', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Apple/i)); // Click on the Apple product

    await waitFor(() => {
      expect(screen.getByText(/Dimensions/i)).toBeInTheDocument(); // Adjust this to match your ProductPage content
    });
  });
  
  // Additional tests can be added here as necessary
});
