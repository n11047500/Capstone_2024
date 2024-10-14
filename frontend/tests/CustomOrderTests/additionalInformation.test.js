import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdditionalInformation from '../../src/pages/CustomOrder/additionalInformation'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('AdditionalInformation', () => {
    const mockOnChange = jest.fn();
    const mockOnBack = jest.fn();
    const navigate = jest.fn();

    const initialData = {
        colorType: '',
        color: '',
        customColor: '',
        width: '',
        wicking: '',
        firstName: '',
        lastName: '',
        email: '',
        comment: '',
        file: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockImplementation(() => navigate); // Mock the useNavigate function
        global.alert = jest.fn(); // Mock the global alert function
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore all mocks after each test
        delete global.fetch; // Clean up global fetch
        delete global.alert; // Clean up global alert
    });

    it('renders the form with all necessary fields', () => {
        render(
            <AdditionalInformation
                data={initialData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByLabelText(/Comments/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Add attachment/i)).toBeInTheDocument();
        expect(screen.getByText(/Submit Form/i)).toBeInTheDocument();
        expect(screen.getByText(/Back/i)).toBeInTheDocument();
    });

    it('handles file input change', () => {
        render(
            <AdditionalInformation
                data={initialData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={jest.fn()}
            />
        );

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText(/Attach a file/i);
        
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        expect(mockOnChange).toHaveBeenCalledWith({ 
            ...initialData, 
            file: file 
        });
    });

    it('handles textarea change', () => {
        render(
            <AdditionalInformation
                data={initialData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={jest.fn()}
            />
        );

        const commentInput = screen.getByLabelText(/Comments/i);
        const comment = 'This is a test comment';

        fireEvent.change(commentInput, { target: { value: comment, name: 'comment' } });

        expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, comment });
    });

    it('calls onBack when back button is clicked', () => {
        render(
            <AdditionalInformation
                data={initialData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={jest.fn()}
            />
        );

        const backButton = screen.getByText(/Back/i);
        fireEvent.click(backButton);
        expect(mockOnBack).toHaveBeenCalled();
    });

    it('submits the form and handles navigation', async () => {
        render(
            <AdditionalInformation
                data={initialData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={jest.fn()}
            />
        );

        // Mock the fetch request
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            })
        );

        const commentInput = screen.getByLabelText(/Comments/i);
        fireEvent.change(commentInput, { target: { value: 'This is a test comment' } });

        const submitButton = screen.getByText(/Submit Form/i);
        fireEvent.click(submitButton);

        // Check that fetch was called with the correct parameters
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:3001/submit-form', expect.any(Object));
        });

        // Check that navigate was called after successful submission
        expect(navigate).toHaveBeenCalledWith('/confirmation');
    });

    it('shows an alert on submission error', async () => {
        render(
            <AdditionalInformation
                data={initialData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={jest.fn()}
            />
        );

        // Mock the fetch call to simulate a failed response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false, // Simulate a failed response
            })
        );

        const submitButton = screen.getByRole('button', { name: /Submit Form/i });
        fireEvent.click(submitButton); // Trigger the form submission

        // Wait for the alert to be called
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Failed to send form.');
        });
    });
});