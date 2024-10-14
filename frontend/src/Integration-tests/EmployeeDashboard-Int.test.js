import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeDashboard from '../pages/EmployeeDashboard'; // Adjust the import path as needed
import { CartContext } from '../context/CartContext'; // Ensure this path is correct
import { BrowserRouter as Router } from 'react-router-dom';

beforeEach(() => {
    // Mock the global fetch function
    global.fetch = jest.fn(() =>
        Promise.resolve({
            //mock the products stored in the database
            json: () => Promise.resolve([
                {
                    Product_ID: '1',
                    Product_Name: 'Mini Standard Planter Box',
                    Product_Price: '250.00',
                    Quantity_Available: '1',
                    Description: 'A compact planter box...',
                    Width: '900',
                    Depth: '450',
                    Height: '800',
                    Product_Image_URL: 'http://example.com/image.jpg',
                    Product_Options: '',
                },
                {
                    Product_ID: '2',
                    Product_Name: 'Large Standard Planter Box',
                    Product_Price: '500.00',
                    Quantity_Available: '2',
                    Description: 'A large planter box...',
                    Width: '1200',
                    Depth: '600',
                    Height: '1000',
                    Product_Image_URL: 'http://example.com/large_image.jpg',
                    Product_Options: '',
                },
            ]),
        })
    );
});

afterEach(() => {
    jest.clearAllMocks(); // Clear the mock after each test
});



describe('Employee Dashboard Integration Tests', () => {
    // Utility function to render the EmployeeDashboard with CartContext
    const renderWithContext = () => {
        return render(
            <Router>
                <CartContext.Provider value={{ addToCart: jest.fn(), cart: [] }}>
                    <EmployeeDashboard />
                </CartContext.Provider>
            </Router>
        );
    };


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
    // Mock fetch for getting the products
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
                {
                    Product_ID: '1',
                    Product_Name: 'Mini Standard Planter Box',
                    Product_Price: '250.00',
                    Quantity_Available: '1',
                    Description: 'A compact planter box...',
                    Width: '900',
                    Depth: '450',
                    Height: '800',
                    Product_Image_URL: 'http://example.com/image.jpg',
                    Product_Options: '',
                },
            ]),
        })
    );

    // Mock fetch for getting the specific product to edit
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                Product_Name: 'Mini Standard Planter Box',
                Product_Price: '250.00',
                Quantity_Available: 1,
                Description: 'A compact planter box...',
                Width: '900',
                Depth: '450',
                Height: '800',
                Product_Image_URL: 'http://example.com/image.jpg',
                Product_Options: '',
            }),
        })
    );

    // Render the EmployeeDashboard with CartProvider
    const { getByText, getByTestId } = renderWithContext();

    // Simulate clicking the "Edit Product" button
    fireEvent.click(getByText(/Edit Product/i));

    // Select a product from the dropdown
    const productSelect = getByTestId('product-select-dropdown');
    fireEvent.change(productSelect, { target: { value: '1' } }); // Assuming '1' is a valid product id

    // Wait for the EditProduct component to be rendered
    await waitFor(() => {
        expect(getByTestId('product-name-input')).toBeInTheDocument();
    });

    // Fill in the form fields
    const productNameInput = getByTestId('product-name-input');
    const priceInput = getByTestId('price-input');
    const quantityInput = getByTestId('quantity-input');
    const descriptionInput = getByTestId('description-input');
    const widthInput = getByTestId('width-input');
    const depthInput = getByTestId('depth-input');
    const heightInput = getByTestId('height-input');
    const optionsInput = getByTestId('options-input');
    const imageUrlInput = getByTestId('image-url-input');
    const updateButton = getByTestId('update-product-button');

    // Set new values for the product
    fireEvent.change(productNameInput, { target: { value: 'Updated Product Name' } });
    fireEvent.change(priceInput, { target: { value: '25.00' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated product description.' } });
    fireEvent.change(widthInput, { target: { value: '100' } });
    fireEvent.change(depthInput, { target: { value: '200' } });
    fireEvent.change(heightInput, { target: { value: '300' } });
    fireEvent.change(optionsInput, { target: { value: 'Updated Options' } });
    fireEvent.change(imageUrlInput, { target: { value: 'http://example.com/new_image.jpg' } });

    // Mock fetch for updating the product
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Product updated successfully' }),
        })
    );

    // Submit the form
    fireEvent.click(updateButton);

    // Wait for the success message to appear
    await waitFor(() => {
        expect(getByText(/Product updated successfully/i)).toBeInTheDocument();
    });
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