import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomisedOrder from './CustomisedOrder';
import { CartProvider } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
  }));
  
  // Mock Cart data
  const mockCart = [
    {
      Product_ID: 1,
      Product_Name: 'Mini Standard Planter Box',
      Product_Price: 250.00,
      quantity: 2,
      selectedOption: 'Surfmist',
      Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624907/mini_standard_planter_box_neqwwl.jpg',
    },
  ];
  
  // Utility function to render with CartProvider
  const renderWithProvider = (ui, { cart = [] } = {}) => {
    return render(
      <MemoryRouter>
        <CartProvider value={{ cart }}>
          {ui}
        </CartProvider>
      </MemoryRouter>
    );
  };
  
  describe('CustomisedOrder Component Integration Tests', () => {
    // Test the initial rendering and moving through the form steps
    test('should render all steps and allow form submission', async () => {
      // Step 1: Render the component
      renderWithProvider(<CustomisedOrder />, { cart: mockCart });
  
      // Step 1: Custom Options
      // Check if the label "Select Colour:" is present and simulate input
      fireEvent.change(screen.getByLabelText('Select Colour:'), { target: { value: 'Black' } });
  
      // Simulate clicking "Next" to move to the second step
      fireEvent.click(screen.getByText('Next'));
  
      // Step 2: Personal Information
      // Verify that the second step is rendered
      expect(screen.getByText('2. Personal Information')).toBeInTheDocument();
  
      // Simulate filling out personal information
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
  
      // Click "Next" to move to the third step
      fireEvent.click(screen.getByText('Next'));
  
      // Step 3: Additional Information
      // Verify that the third step is rendered
      expect(screen.getByText('3. Additional Information')).toBeInTheDocument();
  
      // Simulate filling out additional information
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'No additional info' } });
  
      // Click "Submit" to submit the form
      fireEvent.click(screen.getByText('Submit'));
  
      // Wait for the form submission to complete and for the success message to appear
      await waitFor(() => {
        expect(screen.getByText('Email sent successfully!')).toBeInTheDocument();
      });
    });
  
    // Test form submission failure
    test('displays error message on failed submission', async () => {
      // Mock the fetch call to simulate failure
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
        })
      );
  
      renderWithProvider(<CustomisedOrder />, { cart: mockCart });
  
      // Step 1: Custom Options
      fireEvent.change(screen.getByLabelText('Select Colour:'), { target: { value: 'Black' } });
      fireEvent.click(screen.getByText('Next'));
  
      // Step 2: Personal Information
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.click(screen.getByText('Next'));
  
      // Step 3: Additional Information
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
      fireEvent.click(screen.getByText('Submit'));
  
      // Check for the failure alert
      await waitFor(() => {
        expect(screen.getByText('Failed to send form.')).toBeInTheDocument();
      });
    });
  });


// test('should render the first step and allow navigation to the next step', async () => {
//     renderWithProvider(<CustomisedOrder />);

//     // Wait for the label 'Color' to appear
//     const colourLabel = await screen.findByLabelText('Select Colour:');

//     // Check if step 1 is rendered
//     expect(screen.getByText('1. Custom Options')).toBeInTheDocument();

//     // Mock user input in step 1
//     fireEvent.change(screen.getByLabelText('Color'), { target: { value: 'Black' } });
//     fireEvent.click(screen.getByText('Next'));

//     // Check if it moves to step 2
//     expect(screen.getByText('2. Personal Information')).toBeInTheDocument();
//   });

