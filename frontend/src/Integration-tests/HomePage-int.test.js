import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage'; // Adjust this to the correct path
import ProductPage from '../pages/ProductPage'; // Mock the product page component for navigation test
import { CartContext } from '../context/CartContext'; // Adjust path as needed

// Mock product data
const mockProducts = [
  {
    Product_ID: 1,
    Product_Name: 'Test Product 1',
    Product_Price: 100,
    Product_Image_URL: 'https://example.com/product1.jpg',
  },
  {
    Product_ID: 2,
    Product_Name: 'Test Product 2',
    Product_Price: 200,
    Product_Image_URL: 'https://example.com/product2.jpg',
  },
];

// Mock ProductCard
jest.mock('../components/ProductCard', () => ({ title, price, image }) => (
  <div>
    <h3>{title}</h3>
    <p>{price}</p>
    <img src={image} alt={title} />
  </div>
));

describe('Home Page Integration Tests', () => {
  
  beforeEach(() => {
    // Mock fetch to return product data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockProducts),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);

    return render(
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    );
  };

  const renderWithContext = () => {
    return renderWithRouter(
      <CartContext.Provider value={{ addToCart: jest.fn(), cart: [] }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </CartContext.Provider>
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
      // Use getByRole to target the link specifically
      const linkElement = screen.getByRole('link', { name: /Order Customised Ezee Planter Box/i });
      expect(linkElement).toBeInTheDocument();
    });

    // Simulate clicking the previous button
    fireEvent.click(screen.getByText('←'));

    // Wait for the first slide content to reappear
    await waitFor(() => {
      expect(screen.getByText('The pain-free gardening solution suitable for everybody.')).toBeInTheDocument();
    });
  });

  test('renders featured products and navigates to product page on click', async () => {
    renderWithContext();

    // Wait for products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    // Simulate clicking on a product card (link)
    const productLink = screen.getByText('Test Product 1');
    fireEvent.click(productLink);

    // Wait for the navigation to complete
    await waitFor(() => {
      // Ensure the navigation to the product page happens
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });
  });
});