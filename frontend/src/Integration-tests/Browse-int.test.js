import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Browse from '../pages/Browse'; // Adjust the import path as needed
import { CartContext } from '../context/CartContext'; // Ensure this path is correct
import { BrowserRouter as Router } from 'react-router-dom';
import { useParams } from 'react-router-dom';

beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          {
            Product_ID: 1,
            Product_Name: 'Apple',
            Product_Price: 100,
            Product_Image_URL: 'https://example.com/apple.jpg',
          },
          {
            Product_ID: 2,
            Product_Name: 'Banana',
            Product_Price: 50,
            Product_Image_URL: 'https://example.com/banana.jpg',
          },
          {
            Product_ID: 3,
            Product_Name: 'Cherry',
            Product_Price: 150,
            Product_Image_URL: 'https://example.com/cherry.jpg',
          },
        ]),
      })
    );
  });
  
  afterEach(() => {
    jest.clearAllMocks(); // Clear the mock after each test
  });
  
  describe('Browse Page Integration Tests', () => {
    const mockAddToCart = jest.fn();
  
    const renderWithContext = () => {
      return render(
        <Router>
          <CartContext.Provider value={{ addToCart: mockAddToCart, cart: [] }}>
            <Browse />
          </CartContext.Provider>
        </Router>
      );
    };
  
    test('Renders product cards after fetch', async () => {
      renderWithContext();
  
      // Wait for the products to be fetched and displayed
      await waitFor(() => {
        expect(screen.getByText(/Apple/i)).toBeInTheDocument();
        expect(screen.getByText(/Banana/i)).toBeInTheDocument();
        expect(screen.getByText(/Cherry/i)).toBeInTheDocument();

      });
  
      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('$150')).toBeInTheDocument();

    });

    test('Handles search functionality', async () => {
        renderWithContext(); // Use the renderWithContext function here
      
        // Wait for the initial products to be fetched and displayed
        await waitFor(() => {
          expect(screen.getByText(/Apple/i)).toBeInTheDocument();
        });
      
        const searchInput = screen.getByPlaceholderText(/Search.../i);
        const searchButton = screen.getByRole('button', { name: /search/i });
      
        // Mock the fetch for the search result
        fetch.mockImplementationOnce(() =>
          Promise.resolve({
            json: () => Promise.resolve([
              {
                Product_ID: 1,
                Product_Name: 'Apple',
                Product_Price: 100,
                Product_Image_URL: 'https://example.com/apple.jpg',
              },
            ]),
          })
        );
      
        // Simulate entering a search term
        fireEvent.change(searchInput, { target: { value: 'Apple' } });
        fireEvent.click(searchButton);
      
        // Wait for the search results to be displayed
        await waitFor(() => {
          expect(screen.getByText(/Apple/i)).toBeInTheDocument();
          expect(screen.queryByText(/Banana/i)).not.toBeInTheDocument(); // Ensure other products are not displayed
        });
      });


      test('Displays a default image if Product_Image_URL is not provided', async () => {
        fetch.mockImplementationOnce(() =>
          Promise.resolve({
            json: () => Promise.resolve([
              {
                Product_ID: 1,
                Product_Name: 'Test Product 1',
                Product_Price: 100,
              }, // No image URL provided
            ]),
          })
        );
      
        renderWithContext(); // Use the renderWithContext function here
      
        // Wait for the product to be fetched and displayed
        await waitFor(() => {
          expect(screen.getByText(/Test Product 1/i)).toBeInTheDocument();
        });
      
        const defaultImage = 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1725604960/HicksProductDefault_op2oce.gif';
        expect(screen.getByRole('img', { name: /Test Product 1/i })).toHaveAttribute('src', defaultImage);
      });


    test('sorts products by price: low to high', async () => {
    renderWithContext(); // Use the renderWithContext function
    
    // Wait for the products to be fetched and displayed
    await waitFor(() => {
        expect(screen.getByText(/Apple/i)).toBeInTheDocument();
        expect(screen.getByText(/Banana/i)).toBeInTheDocument();
        expect(screen.getByText(/Cherry/i)).toBeInTheDocument();
    });
    
    // Change the sort type to 'Price: Low to High'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'priceAsc' } });
    
    // Wait for the sorting to be applied
    await waitFor(() => {
        const sortedProducts = screen.getAllByText(/Apple|Banana|Cherry/i); // Match products by their text
        expect(sortedProducts[0]).toHaveTextContent('Banana');
        expect(sortedProducts[1]).toHaveTextContent('Apple');
        expect(sortedProducts[2]).toHaveTextContent('Cherry');
    });
    });

  test('Sorts products by price: high to low', async () => {
    renderWithContext(); // Use the renderWithContext function

    // Wait for the products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
      expect(screen.getByText(/Banana/i)).toBeInTheDocument();
      expect(screen.getByText(/Cherry/i)).toBeInTheDocument();
    });

    // Change the sort type to 'Price: High to Low'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'priceDesc' } });

    // Wait for the sorting to be applied
    await waitFor(() => {
      const sortedProducts = screen.getAllByText(/Apple|Banana|Cherry/i); // Match products by their text
      expect(sortedProducts[0]).toHaveTextContent('Cherry');
      expect(sortedProducts[1]).toHaveTextContent('Apple');
      expect(sortedProducts[2]).toHaveTextContent('Banana');
    });
  });

  test('Sorts products by name: A-Z', async () => {
    renderWithContext(); // Use the renderWithContext function

    // Wait for the products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
      expect(screen.getByText(/Banana/i)).toBeInTheDocument();
      expect(screen.getByText(/Cherry/i)).toBeInTheDocument();
    });

    // Change the sort type to 'Name: A-Z'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'nameAsc' } });

    // Wait for the sorting to be applied
    await waitFor(() => {
        const sortedProducts = screen.getAllByText(/Apple|Banana|Cherry/i); // Match products by their text
        expect(sortedProducts[0]).toHaveTextContent('Apple');
        expect(sortedProducts[1]).toHaveTextContent('Banana');
        expect(sortedProducts[2]).toHaveTextContent('Cherry');
    });
  });

  test('sorts products by name: Z-A', async () => {
    renderWithContext(); // Use the renderWithContext function
    
    // Wait for the products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
      expect(screen.getByText(/Banana/i)).toBeInTheDocument();
      expect(screen.getByText(/Cherry/i)).toBeInTheDocument();
    });
  
    // Change the sort type to 'Name: Z-A'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'nameDesc' } });
  
    // Wait for the sorting to be applied and check the order of products
    await waitFor(() => {
      const sortedProducts = screen.getAllByText(/Apple|Banana|Cherry/i); // Match products by their text
      expect(sortedProducts[0]).toHaveTextContent('Cherry');
      expect(sortedProducts[1]).toHaveTextContent('Banana');
      expect(sortedProducts[2]).toHaveTextContent('Apple');
    });
  });
  
});
