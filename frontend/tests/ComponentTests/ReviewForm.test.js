import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewForm from '../../src/components/ReviewForm';
import { Filter } from 'bad-words';

jest.mock('bad-words', () => {
  return {
    Filter: jest.fn(() => ({
      clean: jest.fn((input) => input), // Mock clean method
    })),
  };
});

describe('ReviewForm', () => {
  const mockOnReviewSubmit = jest.fn();

  beforeEach(() => {
    // Clear any previous mocks
    mockOnReviewSubmit.mockClear();
    // Mock the filter.clean method
    Filter.mockImplementation(() => {
      return {
        clean: jest.fn((comment) => comment), // Return the original comment (clean)
      };
    });
  });

  test('renders the ReviewForm component', () => {
    render(<ReviewForm productId="123" onReviewSubmit={mockOnReviewSubmit} />);

    expect(screen.getByLabelText(/Your Rating:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comments:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('displays error when submitting without rating and comment', async () => {
    render(<ReviewForm productId="123" onReviewSubmit={mockOnReviewSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Both rating and comment are required.');
  });

  test('displays error when comment contains inappropriate language', async () => {
    const mockOnReviewSubmit = jest.fn();

    render(<ReviewForm productId="123" onReviewSubmit={mockOnReviewSubmit} />);

    // Enter a comment with inappropriate language
    fireEvent.change(screen.getByPlaceholderText(/enter your comment/i), { target: { value: 'This is a badword' } });

    // Select the rating by clicking the radio button for rating 5
    fireEvent.click(screen.getByLabelText(/5/i)); // Adjust if the label text differs

    // Click the submit button
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Ensure the mock function was not called (since submission should fail)
    expect(mockOnReviewSubmit).not.toHaveBeenCalled();
});

  test('submits the review successfully', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<ReviewForm productId="123" onReviewSubmit={mockOnReviewSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/enter your comment/i), { target: { value: 'Great product!' } });
    // Select the rating by clicking the radio button for rating 5
    fireEvent.click(screen.getByLabelText('5'));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: '123', rating: '5', comment: 'Great product!' }),
      })
    );

    await waitFor(() =>
      expect(mockOnReviewSubmit).toHaveBeenCalledWith({
        rating: '5',
        comment: 'Great product!',
        first_name: 'Guest User',
      })
    );
  });

  test('handles submission error', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));
    global.fetch = mockFetch;

    render(<ReviewForm productId="123" onReviewSubmit={mockOnReviewSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/enter your comment/i), { target: { value: 'Great product!' } });
    fireEvent.click(screen.getByLabelText('5'));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(async () => {
      expect(await screen.findByRole('alert')).toHaveTextContent('Failed to submit review');
    });
  });
});
