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
        json: () => Promise.resolve([{ Product_ID: '1', Product_Name: 'Test Product 1' }]),
    })
);

describe('EmployeeDashboard Component', () => {
    beforeEach(() => {
        fetch.mockClear(); // Clear mock fetch calls between tests
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
        await waitFor(() => expect(screen.getByText('--Select a Product--')).toBeInTheDocument());

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
        await waitFor(() => expect(screen.getByText('--Select a Product--')).toBeInTheDocument());
    
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
        // Wait for the success message to appear
        expect(await screen.findByText('Product deleted successfully.')).toBeInTheDocument();
    });
    

    test('toggles Grant Access form and submits email', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        // Simulate clicking the Grant Access button to show the form
        fireEvent.click(screen.getByText('Grant Access to New User'));

        // Fill in the email field
        const emailInput = screen.getByPlaceholderText("Enter user's email");
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // Scope the button query to the form
        const form = screen.getByRole('form', { name: /grant access/i }); // Use role to find the form
        const grantAccessButton = within(form).getByRole('button', { name: /grant access/i });

        fireEvent.click(grantAccessButton); // Click the correct Grant Access button

        // Expect fetch to be called with the right parameters
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/update-role`, expect.any(Object));
        });

        // Expect success message to be rendered
        expect(await screen.findByText(/successfully updated test@example\.com to employee role/i)).toBeInTheDocument();
    });

    test('renders OrderManagement component when Manage Orders is clicked', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        fireEvent.click(screen.getByText('Manage Orders'));

        expect(screen.getByText('OrderManagement Component')).toBeInTheDocument();
    });

    test('fetches and displays products on mount', async () => {
        await act(async () => {
            render(<EmployeeDashboard />);
        });

        // Ensure the fetch call is made to the correct endpoint
        expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/products`);

        // Wait for the options to appear in the select element
        await waitFor(() => {
            expect(screen.getByRole('option', { name: /test product 1/i })).toBeInTheDocument();
        });
    });
});
