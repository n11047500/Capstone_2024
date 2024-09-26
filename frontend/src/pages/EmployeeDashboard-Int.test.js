import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeDashboard from './EmployeeDashboard'; // Adjust the import path as necessary
import '@testing-library/jest-dom/extend-expect';


global.fetch = jest.fn(); // Mock fetch globally

describe('EmployeeDashboard', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('should add a new product', async () => {
    // Mock fetch for fetching products
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([]), // Start with no products
      })
    );

    render(<EmployeeDashboard />);

    // Simulate clicking the "Add Product" form button in the dashboard
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

    // Fill out the form to add a product
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A new product' } });
    fireEvent.change(screen.getByLabelText(/Width/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Depth/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Height/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Options/i), { target: { value: 'None' } });
    fireEvent.change(screen.getByLabelText(/Image URL/i), { target: { value: 'http://example.com/image.jpg' } });

    // Mock fetch for adding a product
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Product added successfully' }),
      })
    );

    // Select the second "Add Product" button (the one inside the form)
    const addButton = screen.getAllByRole('button', { name: /add product/i })[1];

    // Submit the form
    fireEvent.click(addButton);

    // Check for success message
    await waitFor(() => expect(screen.getByText('Product added successfully')).toBeInTheDocument());
});

test('should fetch and edit an existing product successfully', async () => {
    // Mock fetch for fetching products
    const mockProducts = [
        {
            Product_ID: '1',
            Product_Name: 'Mini Standard Planter Box',
            Product_Price: '250.00',
            Quantity_Available: '1',
            Description: 'A compact, fully welded, powdercoated aluminium planter box...',
            Width: '900',
            Depth: '450',
            Height: '800',
        },
    ];

    // Mock the fetch call for fetching products
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            json: () => Promise.resolve(mockProducts),
        })
    );

    render(<EmployeeDashboard />);

    // Simulate clicking the "Edit Product" button
    fireEvent.click(screen.getByText('Edit Product'));

    // Select the existing product to edit
    fireEvent.change(screen.getByLabelText(/Select a Product to Edit/i), { target: { value: '1' } });

    // Wait for the product name input to be rendered
    const productNameInput = await screen.findByTestId('product-name');

    // Check if the product name input is rendered
    expect(productNameInput).toBeInTheDocument();

    // Fill out the form to edit the product
    fireEvent.change(productNameInput, { target: { value: 'Updated Mini Standard Planter Box' } }); // Edit product name
    fireEvent.change(screen.getByLabelText(/Product Price/i), { target: { value: '300.00' } }); // Edit price

    // Mock fetch for editing a product
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Product updated successfully' }),
        })
    );

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update product/i }));

    // Check for success message
    await waitFor(() => expect(screen.getByText('Product updated successfully')).toBeInTheDocument());
});

test('should fetch and remove an existing product successfully', async () => {
    // Mock fetch for fetching products
    const mockProducts = [
        { Product_ID: '1', Product_Name: 'Mini Standard Planter Box' },
    ];

    // Mock the fetch call for fetching products
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            json: () => Promise.resolve(mockProducts),
        })
    );

    render(<EmployeeDashboard />);

    // Simulate clicking the "Remove Product" button
    fireEvent.click(screen.getByText('Remove Product'));

    // Wait for the dropdown to be populated
    const productDropdown = await screen.findByLabelText(/Select a Product to Remove/i);

    // Wait for the dropdown options to appear
    await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(2); // Check for the default option plus the mock product
    });

    // Check if the dropdown contains the product
    expect(productDropdown).toHaveTextContent('Mini Standard Planter Box');

    // Select the existing product to remove
    fireEvent.change(productDropdown, { target: { value: '1' } });

    // Mock window.confirm to simulate user clicking "OK"
    window.confirm = jest.fn(() => true);

    // Mock fetch for deleting a product
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
        })
    );

    // Click the "Delete Product" button
    fireEvent.click(screen.getByRole('button', { name: /delete product/i }));

    // Check for success message
    expect(await screen.findByText('Product deleted successfully.')).toBeInTheDocument();

    // Check that the product is removed from the dropdown
    expect(productDropdown).not.toHaveTextContent('Mini Standard Planter Box');
});




});