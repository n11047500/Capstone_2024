import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomOptions from '../../src/pages/CustomOrder/customOptions';

describe('CustomOptions Component', () => {
    const mockOnChange = jest.fn();
    const mockOnNext = jest.fn();

    const defaultData = {
        colorType: 'standard',
        color: '',
        customColor: '',
        width: 100,
        wicking: 'no',
    };

    beforeEach(() => {
        mockOnChange.mockClear();
        mockOnNext.mockClear();
    });

    test('renders with standard colors by default', () => {
        render(<CustomOptions data={defaultData} onChange={mockOnChange} onNext={mockOnNext} />);

        // Check if the "Select Colour" label is in the document
        expect(screen.getByText(/Select Colour:/i)).toBeInTheDocument();

        // Check if "Standard Ezee Colours" is selected
        expect(screen.getByText(/Standard Ezee Colours/i).parentElement).toHaveClass('selected');

        // Check if the dropdown for standard colors is present
        const dropdown = screen.getByText(/Select a color/i);
        expect(dropdown).toBeInTheDocument();

        // Simulate opening the dropdown
        fireEvent.click(dropdown);

        // Verify if the color options are displayed
        const colorOptions = [
            'Surfmist',
            'Domain',
            'Paperbark',
            'Riversand',
            'Jasper',
            'Bushland',
            'Pale Eucalypt',
            'Wilderness',
            'Shale Grey',
            'Windspray',
            'Wallaby',
            'Basalt',
            'Woodland Grey',
            'Grey Ridge',
            'Ironstone',
            'Monument',
            'Satin Black',
            'Pearl White'
        ];

        colorOptions.forEach(color => {
            expect(screen.getByText(color)).toBeInTheDocument();
        });
    });

    test('allows selecting a standard color', () => {
        render(<CustomOptions data={{ ...defaultData, colorType: 'standard' }} onChange={mockOnChange} onNext={mockOnNext} />);

        // Open the dropdown
        fireEvent.click(screen.getByText(/select a color/i));

        // Select a color from the dropdown
        fireEvent.click(screen.getByText(/surfmist/i));

        // Ensure the selected color is shown
        expect(screen.getByText(/surfmist/i)).toBeInTheDocument();

        // Check if onChange has been called with the correct color
        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultData, color: 'Surfmist' });
    });

    test('switches between standard and custom color options', async () => {
        render(<CustomOptions data={defaultData} />);

        const standardOption = screen.getByText('Standard Ezee Colours');
        const customOption = screen.getByText('Custom Colours');

        // Verify initial state
        expect(standardOption).toHaveClass('selected'); // Expect standard option to be selected initially
        expect(customOption).not.toHaveClass('selected');

        // Simulate click to switch to custom option
        fireEvent.click(customOption);

        // Wait for DOM update and verify the custom option is now selected
        await waitFor(() => {
            expect(customOption).toHaveClass('selected');
        });

        await waitFor(() => {
            expect(standardOption).not.toHaveClass('selected');
        });
        // Check if custom color input is rendered
        await waitFor(() => {
            const customColorInput = screen.queryByPlaceholderText(/Enter Custom Color/i);
            expect(customColorInput).toBeInTheDocument();
        });

        // Switch back to standard
        fireEvent.click(standardOption);

        await waitFor(() => {
            const customColorInput = screen.queryByPlaceholderText(/Enter Custom Color/i);
            expect(customColorInput).not.toBeInTheDocument();
        });
    });

    test('changes the width input', () => {
        render(<CustomOptions data={defaultData} onChange={mockOnChange} onNext={mockOnNext} />);

        // Change the width input
        const widthInput = screen.getByPlaceholderText(/enter width in cm/i);
        fireEvent.change(widthInput, { target: { value: 150 } });

        // Check if onChange has been called with the updated width
        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultData, width: '150' });
    });

    test('toggles the wicking option', () => {
        render(<CustomOptions data={defaultData} onChange={mockOnChange} onNext={mockOnNext} />);

        // Select the "Yes" option for wicking
        fireEvent.click(screen.getByText(/yes/i));

        // Check if onChange has been called with the correct wicking option
        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultData, wicking: 'yes' });

        // Select the "No" option for wicking
        fireEvent.click(screen.getByText(/no/i));

        // Check if onChange has been called with the correct wicking option
        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultData, wicking: 'no' });
    });

    test('calls onNext when the "Next" button is clicked', () => {
        const mockOnNext = jest.fn(); // Create a mock function
        const mockOnChange = jest.fn(); // Create a mock function for onChange

        // Render the component with initial props
        render(
            <CustomOptions
                data={{ colorType: 'standard', width: 1, wicking: 'yes' }} // Initial state
                onNext={mockOnNext}
                onChange={mockOnChange}
            />
        );

        // Simulate selecting a color type
        fireEvent.click(screen.getByText('Standard Ezee Colours')); // Click to select standard color type
        fireEvent.click(screen.getByText('Select a color')); // Click to open color selection dropdown
        fireEvent.click(screen.getByText('Surfmist')); // Click to select the first color

        // Simulate entering width and selecting wicking
        fireEvent.change(screen.getByPlaceholderText('Enter width in cm'), { target: { value: 10 } }); // Enter width
        fireEvent.click(screen.getByText('Yes')); // Select "Yes" for wicking

        // Simulate clicking the "Next" button
        fireEvent.click(screen.getByText('Next'));

        // Verify that onNext was called once
        expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    test('does not call onNext if validation fails', () => {
        const mockOnNext = jest.fn();
        const mockOnChange = jest.fn();

        render(
            <CustomOptions
                data={{ colorType: '', width: null, wicking: null }} // No valid data
                onNext={mockOnNext}
                onChange={mockOnChange}
            />
        );

        // Simulate clicking the "Next" button
        fireEvent.click(screen.getByText('Next'));

        // Verify that onNext was not called due to validation
        expect(mockOnNext).toHaveBeenCalledTimes(0);
    });
});
