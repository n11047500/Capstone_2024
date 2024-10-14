import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // for better assertions
import ShippingMethodForm from '../../src/pages/Checkout/ShippingMethodForm';

// Mock image imports
jest.mock('../../src/assets/delivery_truck.svg', () => 'mocked_delivery_truck.svg');
jest.mock('../../src/assets/click_and_collect.svg', () => 'mocked_click_and_collect.svg');

describe('ShippingMethodForm component', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnChange = jest.fn();
  const mockData = { shippingOption: '' };

  beforeEach(() => {
    // Reset the mock functions before each test
    mockOnNext.mockReset();
    mockOnBack.mockReset();
    mockOnChange.mockReset();
  });

  test('renders shipping options correctly', () => {
    render(
      <ShippingMethodForm
        data={mockData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onChange={mockOnChange}
      />
    );

    // Check if both shipping options render
    expect(screen.getByAltText('Click and Collect')).toBeInTheDocument();
    expect(screen.getByAltText('Delivery')).toBeInTheDocument();

    // Check if both buttons are rendered correctly
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  test('calls onChange with correct shipping option when selected', () => {
    render(
      <ShippingMethodForm
        data={mockData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onChange={mockOnChange}
      />
    );

    // Select "Click and Collect" option
    fireEvent.click(screen.getByAltText('Click and Collect'));
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockData,
      shippingOption: 'Click and Collect',
    });

    // Select "Delivery" option
    fireEvent.click(screen.getByAltText('Delivery'));
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockData,
      shippingOption: 'Delivery',
    });
  });

  test('alerts the user when trying to proceed without selecting a shipping option', () => {
    // Mock the global alert function
    const alertMock = jest.spyOn(global, 'alert').mockImplementation(() => {});
  
    render(
      <ShippingMethodForm
        data={{ shippingOption: '' }} // No shipping option selected
        onNext={jest.fn()} // Mock onNext
        onBack={jest.fn()} // Mock onBack
        onChange={jest.fn()} // Mock onChange
      />
    );
  
    // Simulate clicking the Next button without selecting a shipping option
    fireEvent.click(screen.getByText('Next'));
  
    // Check that the alert was called with the correct message
    expect(alertMock).toHaveBeenCalledTimes(1); // Ensure the alert was called once
    expect(alertMock).toHaveBeenCalledWith('Please select a shipping option before proceeding.');
  
    // Clean up the mock after the test
    alertMock.mockRestore();
  });

  test('calls onNext when Next button is clicked after selecting an option', () => {
    render(
      <ShippingMethodForm
        data={{ shippingOption: 'Delivery' }}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onChange={mockOnChange}
      />
    );

    // Click the Next button
    fireEvent.click(screen.getByText('Next'));

    // Check if onNext is called
    expect(mockOnNext).toHaveBeenCalled();
  });

  test('calls onBack when Back button is clicked', () => {
    render(
      <ShippingMethodForm
        data={mockData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onChange={mockOnChange}
      />
    );

    // Click the Back button
    fireEvent.click(screen.getByText('Back'));

    // Check if onBack is called
    expect(mockOnBack).toHaveBeenCalled();
  });
});
