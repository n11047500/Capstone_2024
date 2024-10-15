import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ReviewPage from '../src/pages/ReviewPage';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import { CartContext } from '../src/context/CartContext';  // Import your CartContext

// Initialize jest-fetch-mock
fetchMock.enableMocks();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ productId: '1' }), // Mock productId for testing
}));

jest.mock('bad-words', () => {
  return {
    Filter: jest.fn(() => ({
      clean: jest.fn((input) => input), // Mock clean method
    })),
  };
});

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('ReviewPage Component', () => {
  // Mock CartContext provider values
  const mockCart = {
    cart: [], // Mock empty cart or customize as needed
    addToCart: jest.fn(), // Mock function for adding to cart
  };

  test('displays loading state initially', () => {
    render(
      <CartContext.Provider value={mockCart}>
        <Router>
          <ReviewPage />
        </Router>
      </CartContext.Provider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays product details after fetch', async () => {
    // Mock API responses
    fetchMock.mockResponses(
      [JSON.stringify({ Product_Image_URL: 'image_url', Product_Name: 'Test Product' }), { status: 200 }],
      [JSON.stringify({ reviews: [], ratings: [], reviewCount: 0, averageRating: 0 }), { status: 200 }]
    );

    render(
      <CartContext.Provider value={mockCart}>
        <Router>
          <ReviewPage />
        </Router>
      </CartContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Test Product')).toBeInTheDocument();
    });
  });

  test('handles product fetch error', async () => {
    // Mock failed product fetch
    fetchMock.mockResponses(
      [JSON.stringify({ message: 'Product not found' }), { status: 404 }],
      [JSON.stringify({ reviews: [], ratings: [], reviewCount: 0, averageRating: 0 }), { status: 200 }]
    );

    render(
      <CartContext.Provider value={mockCart}>
        <Router>
          <ReviewPage />
        </Router>
      </CartContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load product details')).toBeInTheDocument();
    });
  });

  test('handles reviews fetch error', async () => {
    // Mock successful product fetch, but failed reviews fetch
    fetchMock.mockResponses(
      [JSON.stringify({ Product_Image_URL: 'image_url', Product_Name: 'Test Product' }), { status: 200 }],
      [JSON.stringify({ message: 'Reviews not found' }), { status: 404 }]
    );

    render(
      <CartContext.Provider value={mockCart}>
        <Router>
          <ReviewPage />
        </Router>
      </CartContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No reviews for this product.')).toBeInTheDocument();
    });
  });

  test('displays reviews and pagination controls', async () => {
    // Mock successful product and reviews fetch
    fetchMock.mockResponses(
      [JSON.stringify({ Product_Image_URL: 'image_url', Product_Name: 'Test Product' }), { status: 200 }],
      [
        JSON.stringify({
          reviews: [
            { first_name: 'John', comment: 'Great product!', rating: 5 },
            { first_name: 'Jane', comment: 'Loved it!', rating: 4 },
          ],
          ratings: [5, 4],
          reviewCount: 2,
          averageRating: 4.5,
        }),
        { status: 200 },
      ]
    );

    render(
      <CartContext.Provider value={mockCart}>
        <Router>
          <ReviewPage />
        </Router>
      </CartContext.Provider>
    );

    // Check for John's review
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Great product!')).toBeInTheDocument();
    });

    // Check for Jane's review
    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Loved it!')).toBeInTheDocument();
    });

    // Check pagination
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled(); // Assuming no further reviews
  });

  test('handles review submission', async () => {
    fetchMock.mockResponses(
      [JSON.stringify({ Product_Image_URL: 'image_url', Product_Name: 'Test Product' }), { status: 200 }],
      [
        JSON.stringify({
          reviews: [{ first_name: 'John', comment: 'Great product!', rating: 5 }],
          ratings: [5],
          reviewCount: 1,
          averageRating: 5.0,
        }),
        { status: 200 },
      ]
    );

    render(
      <CartContext.Provider value={mockCart}>
        <Router>
          <ReviewPage />
        </Router>
      </CartContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Great product!')).toBeInTheDocument();
    });

    // Fill and submit the review form
    const commentField = screen.getByPlaceholderText('Enter your comment'); // This will work now
    fireEvent.change(commentField, { target: { value: 'Amazing product!' } });
    const submitButton = screen.getByText('Submit'); // Change to 'Submit'
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amazing product!')).toBeInTheDocument(); // Ensure the comment appears
    });
  });
});
