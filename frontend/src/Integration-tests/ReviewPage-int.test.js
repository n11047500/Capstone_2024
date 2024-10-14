

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewPage from '../pages/ReviewPage'; // Adjust the path accordingly
import { BrowserRouter as Router } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // Adjust the path accordingly

// Mock useParams to return a specific productId
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}));

describe('ReviewPage Integration Tests', () => {
    const mockCartValue = {
        cart: [], // Adjust based on what you need
        // Add any other context values you need to mock
    };

    beforeEach(() => {
        useParams.mockImplementation(() => ({ productId: '1' }));

        // Mock the fetch API for product and reviews
        global.fetch = jest.fn((url) => {
            if (url.includes('/products/1')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            Product_Name: 'Sample Product',
                            Product_Image_URL: 'sample-product-image.jpg',
                        }),
                });
            }

            if (url.includes('/reviews/1')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            reviews: [
                                { first_name: 'John', comment: 'Great product!', rating: 5 },
                                { first_name: 'Jane', comment: 'Not bad.', rating: 4 },
                                { first_name: 'Alice', comment: 'Fantastic!', rating: 5 },
                                { first_name: 'Bob', comment: 'Could be better.', rating: 3 },
                                { first_name: 'Charlie', comment: 'Loved it!', rating: 5 },
                                { first_name: 'David', comment: 'Okay, I guess.', rating: 3 },
                                { first_name: 'Eve', comment: 'Would buy again!', rating: 4 },
                                { first_name: 'Frank', comment: 'Not what I expected.', rating: 2 },
                            ],
                            ratings: [5, 4, 5, 3, 5, 3, 4, 2],
                            reviewCount: 8,
                            averageRating: 4.0,
                        }),
                });
            }

            // Simulate fetch failure for reviews
            return Promise.resolve({ ok: false });
        });
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls after each test
    });


  test('displays error message on fetch failure', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to load product details'))
    );

    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error: failed to load product details/i)).toBeInTheDocument();
    });
  });

  //test ensures the reeviews for a given product all render in correctly as well as the average review rating and number of reviews
  test('Renders Reviews Page content', async () => {
    render(
        <MemoryRouter>
            <CartContext.Provider value={mockCartValue}>
                <ReviewPage />
            </CartContext.Provider>
        </MemoryRouter>
    );

    // Wait for the product details to load
    await waitFor(() => {
        expect(screen.getByText(/4.0 · 8 reviews/i)).toBeInTheDocument(); // Update the expected text based on the new average rating
    });

    // Check for reviews
    expect(screen.getByText(/great product/i)).toBeInTheDocument();
    expect(screen.getByText(/not bad/i)).toBeInTheDocument();
    expect(screen.getByText(/fantastic/i)).toBeInTheDocument();
    expect(screen.getByText(/could be better/i)).toBeInTheDocument();
    expect(screen.getByText(/loved it/i)).toBeInTheDocument();
    //only first five should appear
});

// test ensures pagination 'next' and 'back' page buttons are rendered and work correctly
test('renders pagination controls and navigates pages', async () => {
    render(
        <MemoryRouter>
            <CartContext.Provider value={mockCartValue}>
                <ReviewPage />
            </CartContext.Provider>
        </MemoryRouter>
    );

    // Wait for the pagination controls to load
    await waitFor(() => {
        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument(); // Adjusted based on 8 reviews with pagination
    });

    // Check if pagination controls are rendered
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    expect(nextPageButton).toBeEnabled(); // Check if next page button is enabled

    // Simulate clicking the next page button
    fireEvent.click(nextPageButton);

    // Wait for the next page of reviews to load
    await waitFor(() => {
        expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument(); // Adjusted based on pagination
    });
});

// test ensures that review submissions go through correctly with the comment and rating for each review recorded  
test('submits review successfully with star rating', async () => {  
    // Mock console.log
    console.log = jest.fn();

    render(
        <MemoryRouter>
            <CartContext.Provider value={mockCartValue}>
                <ReviewPage />
            </CartContext.Provider>
        </MemoryRouter>
    );

    // Wait for the ReviewForm to load
    await waitFor(() => {
        expect(screen.getByText(/create a review/i)).toBeInTheDocument();
    });

    // Fill out the review text input
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'Great product to buy!' } });

    // Input the star rating by selecting the radio button
    const fiveStarInput = screen.getByLabelText('5');
    fireEvent.click(fiveStarInput); // Click on the 5-star radio button

    // Submit the review
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the new review to appear
    await waitFor(() => {
        expect(screen.getByText(/Great product to buy/i)).toBeInTheDocument();
    });

    // Assert that console.log was called with 'Rating: 5'
    const logCalls = console.log.mock.calls; // Get the array of calls to console.log
    expect(logCalls).toEqual(
        expect.arrayContaining([
            expect.arrayContaining(['Rating:', '5']),
        ])
    );
});

});