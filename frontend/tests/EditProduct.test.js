import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditProduct from '../src/pages/EditProduct';

global.fetch = jest.fn();

describe('EditProduct Component', () => {
  const productId = '123';
  const mockProductData = {
    Product_Name: 'Test Product',
    Product_Price: 100,
    Quantity_Available: 10,
    Description: 'This is a test product.',
    Product_Dimensions: '100mm x 200mm x 300mm',
    Product_Options: 'Color: Red',
    Product_Image_URL: 'http://example.com/image.jpg',
  };

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation((url) => {
      if (url.includes(productId)) {
        return Promise.resolve({
          json: () => Promise.resolve(mockProductData),
          ok: true,
        });
      }
      return Promise.reject(new Error('Product not found'));
    });
    process.env.REACT_APP_API_URL = 'http://localhost:4000'; // Mock the environment variable

    // Mock window.location.reload
    delete window.location;
    window.location = { reload: jest.fn() };
    jest.clearAllMocks();
  });

  test('renders the EditProduct component', async () => {
    render(<EditProduct productId={productId} />);

    expect(screen.getByText(/Edit Product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Price/i)).toBeInTheDocument();
  });

  test('fetches product data on mount', async () => {
    render(<EditProduct productId={productId} />);

    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/${productId}`);

    // Assert the input values using waitFor
    await waitFor(() => expect(screen.getByLabelText(/Product Name/i)).toHaveValue(mockProductData.Product_Name));
    await waitFor(() => expect(screen.getByLabelText(/Product Price/i)).toHaveValue(mockProductData.Product_Price));
    await waitFor(() => expect(screen.getByLabelText(/Quantity Available/i)).toHaveValue(mockProductData.Quantity_Available));
    await waitFor(() => expect(screen.getByLabelText(/Description/i)).toHaveValue(mockProductData.Description));
  });

  test('handles form input changes', async () => {
    // Render the component
    render(<EditProduct productId={1} />);
  
    // Find the input element
    const nameInput = screen.getByLabelText(/Product Name/i); // Ensure this matches the label for the input
    
    // Simulate a user changing the input value
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
  
    // Assert that the input's value has been updated
    expect(nameInput).toHaveValue('Updated Product');
  });

  test('submits the form and updates the product', async () => {
    render(<EditProduct productId={productId} />);

    // Wait for the product data to be displayed in the form
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/${productId}`));

    // Fill out the form
    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'Updated Product' } });
    fireEvent.change(screen.getByTestId('price-input'), { target: { value: '150' } });
    fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '20' } });
    fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByTestId('width-input'), { target: { value: '150' } });
    fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '250' } });
    fireEvent.change(screen.getByTestId('height-input'), { target: { value: '350' } });
    fireEvent.change(screen.getByTestId('options-input'), { target: { value: 'Color: Blue' } });
    fireEvent.change(screen.getByTestId('image-url-input'), { target: { value: 'http://example.com/new-image.jpg' } });

    // Mock window.confirm to always return true
    window.confirm = jest.fn(() => true);

    // Submit the form
    fireEvent.click(screen.getByTestId('update-product-button'));

    // Check that fetch was called with the correct URL and body
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/products/${productId}`,
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Product',
          price: '150',
          quantity: '20',
          description: 'Updated Description',
          dimensions: '150mm (width) x 250mm (depth) x 350mm (height)',
          options: 'Color: Blue',
          imageUrl: 'http://example.com/new-image.jpg',
        }),
      })
    );

    // Ensure success message is displayed
    expect(await screen.findByText('Product updated successfully')).toBeInTheDocument();
  });

  test('displays an error message on failed update', async () => {
    // Mock the initial fetch response for product data
    const mockProductData = {
      Product_Name: 'Sample Product',
      Product_Price: '100',
      Quantity_Available: '10',
      Description: 'Sample Description',
      Product_Options: 'Color: Red',
      Product_Image_URL: 'http://example.com/sample-image.jpg',
      Product_Dimensions: '100mm x 200mm x 300mm'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductData,
    });

    // Mock the failed update response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to update product.' }),
    });

    render(<EditProduct productId={productId} />);

    // Wait for the product data to be displayed in the form
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/${productId}`));

    // Fill out the form with new product details
    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'Updated Product' } });
    fireEvent.change(screen.getByTestId('price-input'), { target: { value: '150' } });
    fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '20' } });
    fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByTestId('width-input'), { target: { value: '150' } });
    fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '250' } });
    fireEvent.change(screen.getByTestId('height-input'), { target: { value: '350' } });
    fireEvent.change(screen.getByTestId('options-input'), { target: { value: 'Color: Blue' } });
    fireEvent.change(screen.getByTestId('image-url-input'), { target: { value: 'http://example.com/new-image.jpg' } });

    // Mock window.confirm to always return true
    window.confirm = jest.fn(() => true);

    // Submit the form
    fireEvent.click(screen.getByTestId('update-product-button'));

    // Ensure error message is displayed
    expect(await screen.findByText('Failed to update product.')).toBeInTheDocument();
  });

  test('resets the form data', async () => {
    render(<EditProduct productId={productId} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toHaveValue(mockProductData.Product_Name);
    });

    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Updated Product' } });
    fireEvent.click(screen.getByText(/Reset/i));

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue(mockProductData.Product_Name);
  });

  test('handles error during product update', async () => {
    // Mock the initial fetch response for product data
    const mockProductData = {
      Product_Name: 'Sample Product',
      Product_Price: '100',
      Quantity_Available: '10',
      Description: 'Sample Description',
      Product_Options: 'Color: Red',
      Product_Image_URL: 'http://example.com/sample-image.jpg',
      Product_Dimensions: '100mm x 200mm x 300mm',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductData,
    });

    // Mock the update to throw an error
    fetch.mockImplementationOnce(() => {
      throw new Error('Network error');
    });

    render(<EditProduct productId={productId} />);

    // Wait for the product data to be displayed in the form
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/${productId}`));

    // Fill out the form with new product details
    fireEvent.change(screen.getByTestId('product-name-input'), { target: { value: 'Updated Product' } });
    fireEvent.change(screen.getByTestId('price-input'), { target: { value: '150' } });
    fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '20' } });
    fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByTestId('width-input'), { target: { value: '150' } });
    fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '250' } });
    fireEvent.change(screen.getByTestId('height-input'), { target: { value: '350' } });
    fireEvent.change(screen.getByTestId('options-input'), { target: { value: 'Color: Blue' } });
    fireEvent.change(screen.getByTestId('image-url-input'), { target: { value: 'http://example.com/new-image.jpg' } });

    // Mock window.confirm to always return true
    window.confirm = jest.fn(() => true);

    // Submit the form
    fireEvent.click(screen.getByTestId('update-product-button'));

    // Ensure error message is displayed
    expect(await screen.findByText('An error occurred while updating the product.')).toBeInTheDocument();
  });
});
