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

    test('renders CustomOptions component with standard colors by default', () => {
        render(<CustomOptions data={defaultData} onChange={mockOnChange} onNext={mockOnNext} />);

        // Check that the headings and labels are rendered
        expect(screen.getByText(/custom options/i)).toBeInTheDocument();
        expect(screen.getByText(/select colour/i)).toBeInTheDocument();

        // Check that the "Standard Ezee Colours" and "Custom Colours" options are rendered
        expect(screen.getByText(/standard ezee colours/i)).toBeInTheDocument();
        expect(screen.getByText(/custom colours/i)).toBeInTheDocument();

        // Check that the standard color dropdown is rendered with default "Select a color" text
        expect(screen.getByText(/select a color/i)).toBeInTheDocument();

        // Check that the width input is rendered
        expect(screen.getByPlaceholderText(/enter width in cm/i)).toBeInTheDocument();
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
        const mockOnChange = jest.fn();
        const mockOnNext = jest.fn();
      
        const initialData = { colorType: 'standard', width: 100, customColor: '', color: '', wicking: 'no' };
      
        // Render the CustomOptions component
        const { rerender } = render(<CustomOptions data={initialData} onChange={mockOnChange} onNext={mockOnNext} />);
        
        // Log the entire rendered output for debugging
        screen.debug();
      
        const standardColorOption = screen.getByText(/standard ezee colours/i);
        const customColorOption = screen.getByText(/custom colours/i);
      
        // Log the class names for debugging
        console.log('Initial Standard Option Class:', standardColorOption.className);
        console.log('Initial Custom Option Class:', customColorOption.className);
      
        expect(standardColorOption).toHaveClass('selected');
        expect(customColorOption).not.toHaveClass('selected');
      
        fireEvent.click(customColorOption);
      
        // After clicking, rerender with updated colorType
        rerender(<CustomOptions data={{ ...initialData, colorType: 'custom' }} onChange={mockOnChange} onNext={mockOnNext} />);
      
        await waitFor(() => {
          console.log('Updated Standard Option Class:', standardColorOption.className);
          console.log('Updated Custom Option Class:', customColorOption.className);
          expect(customColorOption).toHaveClass('selected');
        });
      
        expect(standardColorOption).not.toHaveClass('selected');
      
        expect(screen.getByPlaceholderText(/enter custom color/i)).toBeInTheDocument();
      
        fireEvent.change(screen.getByPlaceholderText(/enter custom color/i), { target: { value: 'Blue' } });
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ customColor: 'Blue' }));
      
        fireEvent.click(screen.getByText(/next/i));
        expect(mockOnNext).toHaveBeenCalled();
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
        render(<CustomOptions data={defaultData} onChange={mockOnChange} onNext={mockOnNext} />);

        // Click the "Next" button
        fireEvent.click(screen.getByText(/next/i));

        // Check if onNext has been called
        expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
});
