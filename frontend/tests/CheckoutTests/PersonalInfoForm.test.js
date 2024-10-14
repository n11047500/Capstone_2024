import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // For better assertions
import { useLoadScript } from '@react-google-maps/api';
import PersonalInfoForm from '../../src/pages/Checkout/PersonalInfoForm';

// Mock the useLoadScript hook to simulate Google Maps loading
jest.mock('@react-google-maps/api', () => ({
    useLoadScript: jest.fn(),
  }));
  
  // Mock window.google object
  beforeAll(() => {
    global.window.google = {
      maps: {
        places: {
          Autocomplete: jest.fn(() => ({
            addListener: jest.fn(),
            getPlace: jest.fn(() => ({ formatted_address: '123 Test St, Australia' })),
          })),
        },
      },
    };
  });
  
  describe('PersonalInfoForm component', () => {
    const mockOnNext = jest.fn();
    const mockOnChange = jest.fn();
    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Test St',
    };
  
    beforeEach(() => {
      // Reset mocks before each test
      mockOnNext.mockReset();
      mockOnChange.mockReset();
    });
  
    test('renders all form fields correctly', () => {
      // Mock Google Maps script loading as successful
      useLoadScript.mockReturnValue({ isLoaded: true });
  
      render(<PersonalInfoForm data={mockData} onNext={mockOnNext} onChange={mockOnChange} />);
  
      // Check that the form inputs render with correct values
      expect(screen.getByPlaceholderText('First Name')).toHaveValue('John');
      expect(screen.getByPlaceholderText('Last Name')).toHaveValue('Doe');
      expect(screen.getByPlaceholderText('Email')).toHaveValue('john@example.com');
      expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('1234567890');
      expect(screen.getByPlaceholderText('Address')).toHaveValue('123 Test St');
    });
  
    test('calls onChange when input values change', () => {
      // Mock Google Maps script loading as successful
      useLoadScript.mockReturnValue({ isLoaded: true });
  
      render(<PersonalInfoForm data={mockData} onNext={mockOnNext} onChange={mockOnChange} />);
  
      // Change the first name input value
      const firstNameInput = screen.getByPlaceholderText('First Name');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
  
      // Check if onChange is called with updated data
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockData,
        firstName: 'Jane',
      });
    });
  
    test('handles Google Maps API not loaded scenario', () => {
      // Mock Google Maps script loading as not loaded
      useLoadScript.mockReturnValue({ isLoaded: false });
  
      render(<PersonalInfoForm data={mockData} onNext={mockOnNext} onChange={mockOnChange} />);
  
      // Check that the form fields are still rendered even if the script is not loaded
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    });
  
    test('calls onNext when "Continue to Shipping" button is clicked', () => {
      useLoadScript.mockReturnValue({ isLoaded: true });
  
      render(<PersonalInfoForm data={mockData} onNext={mockOnNext} onChange={mockOnChange} />);
  
      // Simulate button click
      const nextButton = screen.getByText('Continue to Shipping');
      fireEvent.click(nextButton);
  
      // Check if onNext is called
      expect(mockOnNext).toHaveBeenCalled();
    });
  
    test('initializes autocomplete when address input is rendered', () => {
      useLoadScript.mockReturnValue({ isLoaded: true });
  
      render(<PersonalInfoForm data={mockData} onNext={mockOnNext} onChange={mockOnChange} />);
  
      // Simulate rendering of address input
      const addressInput = screen.getByPlaceholderText('Address');
      fireEvent.focus(addressInput);
  
      // Verify that the Autocomplete constructor was called
      expect(window.google.maps.places.Autocomplete).toHaveBeenCalledWith(addressInput, {
        types: ['geocode'],
        componentRestrictions: { country: 'AU' },
      });
    });
  });