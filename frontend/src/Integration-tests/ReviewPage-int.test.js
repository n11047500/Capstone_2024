import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewPage from '../ReviewPage';

// Mock fetch requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      Product_Name: 'Sample Product',
      Product_Image_URL: 'sample-product.jpg',
      reviews: [
        { first_name: 'John', comment: 'Great product!' },
        { first_name: 'Jane', comment: 'Not what I expected.' },
      ],
      ratings: [5, 3],
      reviewCount: 2,
      averageRating: 4.0,
    }),
  })
);

describe('ReviewPage', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('displays loading state initially', () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays error message on fetch failure', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject('API is down')
    );

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load product details/i)).toBeInTheDocument();
    });
  });

  test('renders product details and reviews correctly', async () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/sample product/i)).toBeInTheDocument();
      expect(screen.getByAltText(/sample product/i)).toBeInTheDocument();
      expect(screen.getByText(/4.0 · 2 reviews/i)).toBeInTheDocument();
    });

    // Check if reviews are rendered
    expect(screen.getByText(/great product/i)).toBeInTheDocument();
    expect(screen.getByText(/not what i expected/i)).toBeInTheDocument();
  });

  test('renders pagination controls and navigates pages', async () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument();
    });

    // Simulate pagination (if more reviews exist)
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);
    expect(nextButton).toBeDisabled(); // No more pages
  });

  test('renders ReviewForm', async () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/create a review/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox')).toBeInTheDocument(); // Review form text input
  });
});