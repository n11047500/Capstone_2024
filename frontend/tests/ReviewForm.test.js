import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewForm from '../src/components/ReviewForm';

// Mock the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Review submitted successfully' }),
  })
);

describe('ReviewForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('renders the ReviewForm', () => {
    render(<ReviewForm productId="123" />);

    // Check if the rating input elements are rendered
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`${i}`)).toBeInTheDocument();
    }

    // Check if the comment textarea is rendered
    const commentTextarea = screen.getByRole('textbox', { name: /comments/i });
    expect(commentTextarea).toBeInTheDocument();

    // Check if the submit button is rendered
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('shows error message when submitting without rating or comment', () => {
    render(<ReviewForm productId="123" />);

    // Simulate clicking the submit button
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Check for error message
    expect(screen.getByText(/both rating and comment are required/i)).toBeInTheDocument();
  });

  test('submits the review and resets fields', async () => {
    render(<ReviewForm productId="123" />);

    // Simulate selecting a rating
    fireEvent.click(screen.getByLabelText('1'));
    fireEvent.change(screen.getByRole('textbox', { name: /comments/i }), {
      target: { value: 'Great product!' },
    });

    // Simulate submitting the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for fetch call to resolve
    const successMessage = await screen.findByText(/review submitted successfully/i);

    // Verify fetch was called with the correct arguments
    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: '123',
        rating: '1',
        comment: 'Great product!',
      }),
    });

    // Check if success message is shown and fields are reset
    expect(successMessage).toBeInTheDocument();
    expect(screen.getByLabelText('1')).toBeChecked(); // Rating should remain checked
    expect(screen.getByRole('textbox', { name: /comments/i })).toHaveValue(''); // Comment should be empty
  });

  test('shows error message when fetch fails', async () => {
    // Mock the fetch to return a failed response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<ReviewForm productId="123" />);

    // Simulate selecting a rating and entering a comment
    fireEvent.click(screen.getByLabelText('1'));
    fireEvent.change(screen.getByRole('textbox', { name: /comments/i }), {
      target: { value: 'Bad product!' },
    });

    // Simulate submitting the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for fetch call to resolve
    const errorMessage = await screen.findByText(/failed to submit review/i);

    // Check if error message is shown
    expect(errorMessage).toBeInTheDocument();
  });
});
