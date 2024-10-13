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
          Product_Name: 'Mini Standard Planter Box',
          Product_Descritpion: 'A compact, fully welded, powdercoated aluminium planter box that is suitable for a full kitchen garden or a spectacular annual colour display.',
          Product_Price: 250,
          Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624907/mini_standard_planter_box_neqwwl.jpg',
        },
        {
          Product_ID: 2,
          Product_Name: 'Small Standard Planter Box',
          Product_Descritpion: 'A small, fully welded, powdercoated aluminium planter box that is suitable for a small kitchen garden or a spectacular annual colour display.',
          Product_Price: 265.00,
          Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624910/small_standard_planter_box_j0ogy8.jpg',
        },
        {
          Product_ID: 3,
          Product_Name: 'Medium Standard Planter Box',
          Product_Descritpion: 'A mid size, fully welded, powdercoated aluminium planter box that is suitable for a full kitchen garden or a spectacular annual colour display.',
          Product_Price: 315,
          Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624906/medium_standard_planter_box_t790ia.jpg',
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
      expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Medium Standard Planter Box/i)).toBeInTheDocument();
    });
  });

  test('navigates to product page on product click', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Mini Standard Planter Box/i)); // Click on the Mini Standard Planter Box product

    await waitFor(() => {
      expect(screen.getByText(/Dimensions/i)).toBeInTheDocument(); // Adjust this to match your ProductPage content
    });
  });
});
