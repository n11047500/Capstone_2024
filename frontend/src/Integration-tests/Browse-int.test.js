import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Browse from '../pages/Browse'; // Adjust the import path as needed
import { CartContext } from '../context/CartContext'; // Ensure this path is correct
import { BrowserRouter as Router } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// Manually mock the default image directly in the test
jest.mock('../assets/default_image.jpg', () => 'default-image-mock');

beforeEach(() => {
    global.fetch = jest.fn(() =>
      // mock the product data
      Promise.resolve({
        json: () => Promise.resolve([
          {
            Product_ID: 1,
            Product_Name: 'Mini Standard Planter Box',
            Product_Descritpion: 'A compact, fully welded, powdercoated aluminium planter box that is suitable for a full kitchen garden or a spectacular annual colour display.',
            Product_Price: 250,
            Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624907/mini_standard_planter_box_neqwwl.jpg',
          },
          {
            Product_ID: 2,
            Product_Name: 'Small Standard Planter Box',
            Product_Descritpion: 'A small, fully welded, powdercoated aluminium planter box that is suitable for a small kitchen garden or a spectacular annual colour display.',
            Product_Price: 265.00,
            Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624910/small_standard_planter_box_j0ogy8.jpg',
          },
          {
            Product_ID: 3,
            Product_Name: 'Medium Standard Planter Box',
            Product_Descritpion: 'A mid size, fully welded, powdercoated aluminium planter box that is suitable for a full kitchen garden or a spectacular annual colour display.',
            Product_Price: 315,
            Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624906/medium_standard_planter_box_t790ia.jpg',
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
        expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
        expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
        expect(screen.getByText(/Medium Standard Planter Box/i)).toBeInTheDocument();

      });
      //check if the prices of each product are displayed
      expect(screen.getByText('$250')).toBeInTheDocument();
      expect(screen.getByText('$265')).toBeInTheDocument();
      expect(screen.getByText('$315')).toBeInTheDocument();

    });

    test('Handles search functionality', async () => {
        renderWithContext(); // Use the renderWithContext function here
      
        // Wait for the initial products to be fetched and displayed
        await waitFor(() => {
          expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
        });
      
        const searchInput = screen.getByPlaceholderText(/Search.../i);
        const searchButton = screen.getByRole('button', { name: /search/i });
      
        // Mock the fetch for the search result
        fetch.mockImplementationOnce(() =>
          Promise.resolve({
            json: () => Promise.resolve([
              {
                Product_ID: 1,
                Product_Name: 'Mini Standard Planter Box',
                Product_Price: 250,
                Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624907/mini_standard_planter_box_neqwwl.jpg',
              },
            ]),
          })
        );
      
        // Simulate entering a search term
        fireEvent.change(searchInput, { target: { value: 'Mini Standard Planter Box' } });
        fireEvent.click(searchButton);
      
        // Wait for the search results to be displayed
        await waitFor(() => {
          expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
          expect(screen.queryByText(/Small Standard Planter Box/i)).not.toBeInTheDocument(); // Ensure other products are not displayed
        });
      });



test('Displays a default image if Product_Image_URL is not provided', async () => {
  // Mocking the fetch response only for this test to return a product without an image URL
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        {
          Product_ID: 1,
          Product_Name: 'Test Product 1',
          Product_Descritpion: 'A test product',
          Product_Price: 100,
          // No Product_Image_URL provided here
        },
      ]),
    })
  );

  renderWithContext();

  // Wait for the product to be fetched and displayed
  await waitFor(() => {
    expect(screen.getByText(/Test Product 1/i)).toBeInTheDocument();
  });

  // Check if the image element is in the document with the correct alt text
  const imgElement = screen.getByRole('img', { name: /Test Product 1/i });
  expect(imgElement).toBeInTheDocument();

  // Ensure that the img src is manually mocked to 'default-image-mock'
  expect(imgElement).toHaveAttribute('src', 'default-image-mock');
});


    test('sorts products by price: low to high', async () => {
    renderWithContext(); // Use the renderWithContext function
    
    // Wait for the products to be fetched and displayed
    await waitFor(() => {
        expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
        expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
        expect(screen.getByText(/Medium Standard Planter Box/i)).toBeInTheDocument();
    });
    
    // Change the sort type to 'Price: Low to High'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'priceAsc' } });
    
    // Wait for the sorting to be applied
    await waitFor(() => {
        const sortedProducts = screen.getAllByText(/Mini Standard Planter Box|Small Standard Planter Box|Medium Standard Planter Box/i); // Match products by their text
        expect(sortedProducts[0]).toHaveTextContent('Mini Standard Planter Box');
        expect(sortedProducts[1]).toHaveTextContent('Small Standard Planter Box');
        expect(sortedProducts[2]).toHaveTextContent('Medium Standard Planter Box');
    });
    });

  test('Sorts products by price: high to low', async () => {
    renderWithContext(); // Use the renderWithContext function

    // Wait for the products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Medium Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
    });

    // Change the sort type to 'Price: High to Low'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'priceDesc' } });

    // Wait for the sorting to be applied
    await waitFor(() => {
      const sortedProducts = screen.getAllByText(/Mini|Small|Medium/i); // Match products by their text
      expect(sortedProducts[0]).toHaveTextContent('Medium Standard Planter Box');
      expect(sortedProducts[1]).toHaveTextContent('Small Standard Planter Box');
      expect(sortedProducts[2]).toHaveTextContent('Mini Standard Planter Box');
    });
  });

  test('Sorts products by name: A-Z', async () => {
    renderWithContext(); // Use the renderWithContext function

    // Wait for the products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Medium Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
    });

    // Change the sort type to 'Name: A-Z'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'nameAsc' } });

    // Wait for the sorting to be applied
    await waitFor(() => {
        const sortedProducts = screen.getAllByText(/Mini Standard Planter Box|Medium Standard Planter Box|Small Standard Planter Box/i); // Match products by their text
        expect(sortedProducts[0]).toHaveTextContent('Medium Standard Planter Box');
        expect(sortedProducts[1]).toHaveTextContent('Mini Standard Planter Bo');
        expect(sortedProducts[2]).toHaveTextContent('Small Standard Planter Box');
    });
  });

  test('sorts products by name: Z-A', async () => {
    renderWithContext(); // Use the renderWithContext function
    
    // Wait for the products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText(/Small Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Mini Standard Planter Box/i)).toBeInTheDocument();
      expect(screen.getByText(/Medium Standard Planter Box/i)).toBeInTheDocument();
    });
  
    // Change the sort type to 'Name: Z-A'
    const sortDropdown = screen.getByRole('combobox'); // No need to specify the name
    fireEvent.change(sortDropdown, { target: { value: 'nameDesc' } });
  
    // Wait for the sorting to be applied and check the order of products
    await waitFor(() => {
      const sortedProducts = screen.getAllByText(/Mini Standard Planter Box|Medium Standard Planter Box|Small Standard Planter Box/i); // Match products by their text
      expect(sortedProducts[0]).toHaveTextContent('Small Standard Planter Box');
      expect(sortedProducts[1]).toHaveTextContent('Mini Standard Planter Box');
      expect(sortedProducts[2]).toHaveTextContent('Medium Standard Planter Box');
    });
  });
  
});
