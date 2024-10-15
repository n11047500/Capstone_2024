import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewForm from '../../src/components/ReviewForm';

jest.mock('bad-words', () => {
  return {
    Filter: jest.fn(() => ({
      clean: jest.fn((input) => input), // Mock clean method
    })),
  };
});

// Mock the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Review submitted successfully' }),
  })
);

describe('ReviewForm', () => {
  const mockOnReviewSubmit = jest.fn();
  const productId = '12345';

  afterEach(() => {
    jest.clearAllMocks(); // Clear any mock calls after each test
    fetch.mockClear(); // Clear the fetch mock after each test
  });

  test('renders the form', () => {
    const mockOnReviewSubmit = jest.fn();
    const productId = '12345'; // Use a valid product ID for testing
  
    render(<ReviewForm productId={productId} onReviewSubmit={mockOnReviewSubmit} />);
  
    expect(screen.getByLabelText(/your rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('shows error message when rating is not selected', async () => {
    render(<ReviewForm productId={productId} onReviewSubmit={mockOnReviewSubmit} />);

    // Submit the form without selecting a rating or entering a comment
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/both rating and comment are required/i)).toBeInTheDocument();
    });
  });

  test('shows error message when comment is empty', async () => {
    render(<ReviewForm productId={productId} onReviewSubmit={mockOnReviewSubmit} />);

    // Select a rating but leave the comment empty
    fireEvent.click(screen.getByLabelText('1'));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/both rating and comment are required/i)).toBeInTheDocument();
    });
  });

  test('shows error message when comment contains profanity', async () => {
    const mockOnReviewSubmit = jest.fn();
    const productId = '12345'; // Use a valid product ID for testing
  
    render(<ReviewForm productId={productId} onReviewSubmit={mockOnReviewSubmit} />);
  
    // Select a rating and enter a comment with profanity
    fireEvent.click(screen.getByLabelText('1')); // Click the rating label to select a rating
    fireEvent.change(screen.getByPlaceholderText(/enter your comment/i), { target: { value: 'This is a test with damn' } });
  
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/your comment contains inappropriate language/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('submits the review successfully', async () => {
    render(<ReviewForm productId={productId} onReviewSubmit={mockOnReviewSubmit} />);

    // Select a rating and enter a valid comment
    fireEvent.click(screen.getByLabelText('5'));
    fireEvent.change(screen.getByPlaceholderText(/enter your comment/i), { target: { value: 'Great product!' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnReviewSubmit).toHaveBeenCalledWith({
        rating: '5',
        comment: 'Great product!',
        first_name: 'Guest User',
      });
    });

    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/reviews`, expect.any(Object));
  });
});
