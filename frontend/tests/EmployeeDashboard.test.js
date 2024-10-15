import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EmployeeDashboard from '../src/pages/EmployeeDashboard';

// Mocking child components for testing
jest.mock('../src/pages/AddProduct', () => () => <div>AddProduct Component</div>);
jest.mock('../src/pages/EditProduct', () => ({ productId }) => <div>EditProduct Component for {productId}</div>);
jest.mock('../src/pages/OrderManagement', () => () => <div>OrderManagement Component</div>);

// Mock the fetch API for products
global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        { Product_ID: '1', Product_Name: 'Product 1' },
        { Product_ID: '2', Product_Name: 'Product 2' },
        { Product_ID: '3', Product_Name: 'Product 3' },
      ]),
    })
  );

describe('EmployeeDashboard Component', () => {
    beforeEach(() => {
        fetch.mockClear(); // Clear mock fetch calls between tests
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    test('renders dashboard buttons', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        expect(screen.getByText('Add Product')).toBeInTheDocument();
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
        expect(screen.getByText('Remove Product')).toBeInTheDocument();
        expect(screen.getByText('Grant Access to New User')).toBeInTheDocument();
        expect(screen.getByText('Manage Orders')).toBeInTheDocument();
    });

    test('toggles Add Product form', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        fireEvent.click(screen.getByText('Add Product'));
        expect(screen.getByText('AddProduct Component')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Add Product')); // Toggle off
        expect(screen.queryByText('AddProduct Component')).toBeNull();
    });

    test('toggles Edit Product form and selects product', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        fireEvent.click(screen.getByText('Edit Product'));

        // Wait for the products to load
        expect(await screen.findByText('--Select a Product--')).toBeInTheDocument();

        // Simulate product selection
        fireEvent.change(screen.getByLabelText('Select a Product to Edit:'), {
            target: { value: '1' },
        });

        // Expect EditProduct component to show with the selected product ID
        expect(screen.getByText('EditProduct Component for 1')).toBeInTheDocument();
    });

    test('toggles Remove Product form and simulates delete', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        fireEvent.click(screen.getByText('Remove Product'));

        // Wait for the products to load
        expect(await screen.findByText('--Select a Product--')).toBeInTheDocument();

        // Simulate product selection
        fireEvent.change(screen.getByLabelText('Select a Product to Remove:'), {
            target: { value: '1' },
        });

        // Wait for the delete button to appear
        await waitFor(() => {
            const deleteButton = screen.queryByText(/delete/i);
            expect(deleteButton).toBeInTheDocument(); // Ensure delete button is present
        });

        // Mock confirmation dialog
        window.confirm = jest.fn(() => true); // Mock confirmation dialog

        // Click the delete button
        const deleteButton = screen.getByText(/delete/i);
        fireEvent.click(deleteButton);

        // Expect fetch call and message to display
        expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/1`, { method: 'DELETE' });
    });


    test('toggles Grant Access form and submits email', async () => {
        // Mocking fetch to simulate a successful role update response
        fetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ message: 'Successfully updated test@example.com to employee role.' }),
        });
    
        // Wrap rendering and user actions in act()
        await act(async () => {
          render(<EmployeeDashboard />);
        });
    
        // Click to toggle the Grant Access form
        await act(async () => {
          fireEvent.click(screen.getByText(/grant access to new user/i));
        });
    
        // Check that the Grant Access form is visible
        expect(screen.getByLabelText(/enter user's email/i)).toBeInTheDocument();
    
        // Simulate user entering an email
        const emailInput = screen.getByPlaceholderText(/enter user's email/i);
        await act(async () => {
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        });
    
        // Simulate form submission by selecting the specific button using getByRole
        await act(async () => {
            const buttons = screen.queryAllByRole('button', { name: /grant access/i });
            // Assuming you want to click the second one which is the form's submit button
            fireEvent.click(buttons[1]); // Change index as needed based on your button order
          });      
      });

    test('renders OrderManagement component when Manage Orders is clicked', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        fireEvent.click(screen.getByText('Manage Orders'));

        expect(screen.getByText('OrderManagement Component')).toBeInTheDocument();
    });

    test('calls confirm before deleting a product', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });
    
        fireEvent.click(screen.getByText('Remove Product'));
    
        const productSelect = screen.getByLabelText('Select a Product to Remove:');
        fireEvent.change(productSelect, { target: { value: '1' } });
    
        const deleteButton = screen.getByText(/delete/i);
    
        // Mock the confirmation dialog
        window.confirm = jest.fn(() => true);
        
        fireEvent.click(deleteButton);
    
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product?');
        expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products/1`, { method: 'DELETE' });
    }); 
});
