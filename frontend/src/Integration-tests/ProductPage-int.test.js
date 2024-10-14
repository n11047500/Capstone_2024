import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductPage from '../pages/ProductPage';
import { CartContext } from '../context/CartContext'; // Ensure this path is correct
import { MemoryRouter, Routes, Route } from 'react-router-dom'; // Import Routes and Route
import ReviewsPage from '../pages/ReviewPage'; // Mock this page for the test
import { useParams } from 'react-router-dom';


// Mock useParams to return a specific productId
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
  }));
  
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          Product_ID: 1,
          Product_Name: 'Test Product',
          Description: 'This is a test product',
          Product_Price: 100,
          Product_Dimensions: '10x10x10',
          Product_Options: ['Option 1', 'Option 2'],
          averageRating: 4.5,
          reviewCount: 10, // Ensure reviews are present for testing the link
        }),
      })
    );
    useParams.mockReturnValue({ id: '1' }); // Mock product id param
  });
  
  afterEach(() => {
    jest.clearAllMocks(); // Clear the mock after each test
  });
  
  describe('Product Page Integration Tests', () => {
    const renderWithContext = () => {
      return render(
        <MemoryRouter initialEntries={['/product/1']}> {/* MemoryRouter used for testing */}
          <CartContext.Provider value={{ addToCart: jest.fn(), cart: [] }}>
            <Routes>
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/reviews/:productId" element={<ReviewsPage />} />
            </Routes>
          </CartContext.Provider>
        </MemoryRouter>
      );
    };

    //test ensures all the required product details render correctly including description, price, dimensions, rating, and review count 
    test('displays product details after fetch', async () => {
        renderWithContext();
    
        // Wait for the product title (assumed to be in an h1 element) to be displayed
        const title = await screen.findByRole('heading', { level: 1 });
        expect(title).toHaveTextContent('Test Product'); // Check if the heading contains the correct text
    
        // Update to match the correct product description from the mock data
        expect(screen.getByText(/This is a test product/i)).toBeInTheDocument();
    
        // Check for the price
        expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    
        // Use a more flexible matcher for dimensions
        const dimensionsText = screen.getByText(/Dimensions:/i);
        expect(dimensionsText).toBeInTheDocument(); // Check for "Dimensions:" separately
    
        // Now check if the full content matches
        expect(dimensionsText).toHaveTextContent("Dimensions:"); // Check the part before the dimensions
        expect(screen.getByText(/10x10x10/i)).toBeInTheDocument(); // Check for the dimensions separately
    
        // Check for the rating and review count
        expect(screen.getByText(/4.50/i)).toBeInTheDocument();
        expect(screen.getByText(/10 reviews/i)).toBeInTheDocument();
    });

    // test ensures users can addd products to the cart by selecting product option and then clicking the "Add to Cart" button 
    test('adds product to cart', async () => { 
        // Mock the addToCart function
        const mockAddToCart = jest.fn();
    
        // Mock the fetch API to return a product
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    Product_Name: 'Test Product',
                    Product_Options: ['Option 1', 'Option 2'],
                }),
            })
        );
    
        // Render the component with CartContext and mock function
        render(
            <MemoryRouter initialEntries={['/product/1']}>
                <CartContext.Provider value={{ addToCart: mockAddToCart, cart: [] }}>
                    <Routes>
                        <Route path="/product/:id" element={<ProductPage />} />
                        <Route path="/reviews/:productId" element={<ReviewsPage />} />
                    </Routes>
                </CartContext.Provider>
            </MemoryRouter>
        );
    
        // Wait for the product details to be displayed
        await screen.findByText(/Test Product/i);
    
        const addToCartButton = screen.getByText(/Add to Cart/i);
        
        // Select an option if available
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Option 1' } });
        
        // Change quantity to 2
        fireEvent.change(screen.getByLabelText(/Quantity:/i), { target: { value: '2' } });
    
        fireEvent.click(addToCartButton);
    
        // Assert that addToCart was called with the correct product and quantity
        expect(mockAddToCart).toHaveBeenCalledWith(
            expect.objectContaining({ Product_Name: 'Test Product', selectedOption: 'Option 1' }),
            2
        );
    });

    // test ensures users must select a product option before adding it to the cart displaying alert error message 'Please select an option'
    test('alerts user when no option is selected', async () => {
        // Mock the fetch API to return a product
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    Product_Name: 'Test Product',
                    Product_Options: 'Option 1,Option 2',
                }),
            })
        );

        renderWithContext();

        await screen.findByText(/Test Product/i);

        const addToCartButton = screen.getByText(/Add to Cart/i);
        
        // Mock alert
        window.alert = jest.fn();

        fireEvent.click(addToCartButton);

        expect(window.alert).toHaveBeenCalledWith('Please select an option');
    });

    // test ensures that when users click the reviews link they will navigate to the reviews page
    test('navigates to reviews page when reviews link is clicked', async () => {
        renderWithContext();
    
        // Wait for the product and reviews link to render
        await waitFor(() => {
          expect(screen.getByText(/10 reviews/i)).toBeInTheDocument();
        });
    
        // Click the reviews link
        fireEvent.click(screen.getByText(/10 reviews/i));
    
        // Wait for the reviews page to load
        await waitFor(() => {
          expect(screen.getByText(/Create a Review/i)).toBeInTheDocument(); // Adjust based on your reviews page content
        });
      });
});
