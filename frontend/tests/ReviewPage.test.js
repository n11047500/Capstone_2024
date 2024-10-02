import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewPage from '../src/pages/ReviewPage';
import '@testing-library/jest-dom';
import { CartContext } from '../src/context/CartContext';

// Mock useParams from react-router-dom
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn(),
  }));
  
  describe('ReviewPage', () => {
    const mockProduct = {
      Product_Name: 'Test Product',
      Product_Image_URL: 'http://example.com/test-product.jpg',
    };
  
    const mockReviews = {
      reviews: [
        { first_name: 'John', comment: 'Great product!' },
        { first_name: 'Jane', comment: 'Not bad.' },
      ],
      ratings: [5, 4],
      reviewCount: 2,
      averageRating: 4.5,
    };
  
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
  
      // Mock useParams to simulate productId
      useParams.mockReturnValue({ productId: '1' });
  
      // Mock useNavigate to simulate navigation (you can leave it as a no-op for now)
      useNavigate.mockReturnValue(jest.fn());
  
      // Mock global fetch
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProduct,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockReviews,
        });
    });
  
    it('renders without crashing and shows loading state', () => {
      // Provide the CartContext with a mock value
      const cartMock = { cart: [] }; // Adjust as needed for your tests
  
      // Render the component with CartContext provider
      render(
        <CartContext.Provider value={cartMock}>
          <ReviewPage />
        </CartContext.Provider>
      );
  
      // Check that "Loading..." is shown initially
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });
  
    test('fetches and displays product and reviews correctly', async () => {
        const cartMock = { cart: [] }; // Mock cart context value
      
        render(
          <CartContext.Provider value={cartMock}>
            <ReviewPage />
          </CartContext.Provider>
        );
      
        // Use findByText for async fetching and rendering
        const productName = await screen.findByText('Test Product');
        expect(productName).toBeInTheDocument();
      
        // Check if reviews are rendered
        expect(screen.getByText(/Great product!/i)).toBeInTheDocument();
        expect(screen.getByText(/Not bad./i)).toBeInTheDocument();
      });      
  
    it('displays an error message when the product fetch fails', async () => {
      // Mock fetch to simulate a failed product fetch
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockReviews,
        });
  
      // Provide the CartContext with a mock value
      const cartMock = { cart: [] }; // Adjust as needed for your tests
  
      render(
        <CartContext.Provider value={cartMock}>
          <ReviewPage />
        </CartContext.Provider>
      );
  
      // Wait for the error message to appear
      await waitFor(() => expect(screen.getByText(/Failed to load product details/i)).toBeInTheDocument());
    });
  
    it('displays "No reviews for this product." when there are no reviews', async () => {
      // Mock fetch for product and empty reviews
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProduct,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reviews: [],
            ratings: [],
            reviewCount: 0,
            averageRating: 0,
          }),
        });
  
      // Provide the CartContext with a mock value
      const cartMock = { cart: [] }; // Adjust as needed for your tests
  
      render(
        <CartContext.Provider value={cartMock}>
          <ReviewPage />
        </CartContext.Provider>
      );
  
      // Wait for the reviews to load
      await waitFor(() => expect(screen.getByText(/No reviews for this product/i)).toBeInTheDocument());
    });
  });