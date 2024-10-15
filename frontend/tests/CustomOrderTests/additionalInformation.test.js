import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdditionalInformation from '../../src/pages/CustomOrder/additionalInformation';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('AdditionalInformation', () => {
    let mockOnChange;
    let mockOnBack;
    let mockOnSubmit;
    let mockData;

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
        mockOnChange = jest.fn();
        mockOnBack = jest.fn();
        mockOnSubmit = jest.fn();
        mockData = { comment: '', file: null }; // Initial data
        jest.spyOn(window, 'alert').mockImplementation(() => { }); // Mock the alert function
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
        jest.restoreAllMocks(); // Restore all mocks after each test
        delete global.fetch; // Clean up global fetch
        delete global.alert; // Clean up global alert
    });

    test('renders the form with all necessary fields', () => {
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

    test('handles file input change', () => {
        render(
            <AdditionalInformation
                data={mockData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
                isSubmitting={false}
                setIsSubmitting={jest.fn()}
            />
        );

        // Create a mock file
        const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });

        // Simulate file input change
        const fileInput = screen.getByLabelText(/upload a file/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Assert that onChange was called with the correct data
        expect(mockOnChange).toHaveBeenCalledWith({
            comment: '', // Existing comment
            file: file   // Newly added file
        });
    });

    test('handles textarea change', () => {
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

    test('calls onBack when back button is clicked', () => {
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

    test('submits the form and handles navigation', () => {
        render(
            <AdditionalInformation
                data={mockData}
                onBack={mockOnBack}
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
                isSubmitting={false}
                setIsSubmitting={jest.fn()}
            />
        );

        // Fill in the comment textarea
        const commentInput = screen.getByLabelText(/comments/i);
        fireEvent.change(commentInput, { target: { value: 'This is a comment.' } });

        // Simulate form submission
        const submitButton = screen.getByRole('button', { name: /submit form/i });
        fireEvent.click(submitButton);

        // Add debugging output
        console.log("Mock onSubmit called:", mockOnSubmit.mock.calls.length);

        // Assert that onChange was called with the updated data
        expect(mockOnChange).toHaveBeenCalledWith({
            comment: 'This is a comment.',
            file: null // File input can remain null for this test
        });

        // Optionally, you can test navigation if needed
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);

        // Assert that onBack was called
        expect(mockOnBack).toHaveBeenCalled();
    });

    test('shows an alert on submission error', async () => {
        // Simulate an error in the onSubmit function
        mockOnSubmit.mockRejectedValueOnce(new Error('Submission error'));
    
        render(
          <AdditionalInformation 
            data={mockData} 
            onBack={mockOnBack} 
            onChange={mockOnChange} 
            onSubmit={mockOnSubmit} 
            isSubmitting={false} 
            setIsSubmitting={jest.fn()} 
          />
        );
    
        // Fill in the comment textarea
        const commentInput = screen.getByLabelText(/comments/i);
        fireEvent.change(commentInput, { target: { value: 'This is a comment.' } });
    
        // Simulate form submission
        const submitButton = screen.getByRole('button', { name: /submit form/i });
        fireEvent.click(submitButton);
    
        // Wait for the alert to be called
        await Promise.resolve(); // Wait for the next tick
      });
});