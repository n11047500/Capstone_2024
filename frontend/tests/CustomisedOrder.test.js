import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import CustomisedOrder from '../src/pages/CustomOrder/CustomisedOrder';
import { CartContext } from '../src/context/CartContext'; // Import CartContext

// Mock child components
jest.mock('../src/pages/CustomOrder/customOptions.js', () => jest.fn(() => <div>Custom Options Component</div>));
jest.mock('../src/pages/CustomOrder/personalInfo', () => jest.fn(() => <div>Personal Info Component</div>));
jest.mock('../src/pages/CustomOrder/additionalInformation', () => jest.fn(() => <div>Additional Information Component</div>));

// Mock CartContext
const mockCartContextValue = {
  cart: [], // Mock empty cart data for testing
};

const renderWithProviders = (ui, cartValue = mockCartContextValue) => {
  return render(
    <CartContext.Provider value={cartValue}>
      <MemoryRouter>{ui}</MemoryRouter> {/* Wrap component with MemoryRouter */}
    </CartContext.Provider>
  );
};

describe('CustomisedOrder Component', () => {
  test('renders CustomOptions component on step 1', () => {
    renderWithProviders(<CustomisedOrder />);
    
    // Step 1 should show CustomOptions component
    expect(screen.getByText('Custom Options Component')).toBeInTheDocument();
    
    // Check that step 1 is marked as active
    const step1 = screen.getByText('1. Custom Options');
    expect(step1).toHaveClass('active');
  });

  test('navigates to PersonalInfo component on step 2', () => {
    renderWithProviders(<CustomisedOrder />);
    
    // Move to step 2
    fireEvent.click(screen.getByText('Custom Options Component')); // Simulate next step
    expect(screen.getByText((content) => content.includes('Personal Info Component'))).toBeInTheDocument();
    
    // Check that step 2 is marked as active
    const step2 = screen.getByText('2. Personal Information');
    expect(step2).toHaveClass('active');
  });

  test('navigates to AdditionalInformation component on step 3', () => {
    renderWithProviders(<CustomisedOrder />);
    
    // Move to step 2
    fireEvent.click(screen.getByText('Custom Options Component'));
    // Move to step 3
    fireEvent.click(screen.getByText((content) => content.includes('Personal Info Component')));
    
    expect(screen.getByText((content) => content.includes('Additional Information Component'))).toBeInTheDocument();
    
    // Check that step 3 is marked as active
    const step3 = screen.getByText('3. Additional Information');
    expect(step3).toHaveClass('active');
  });

  test('navigates back from step 3 to step 2', async () => {
    renderWithProviders(<CustomisedOrder />);
    
    // Move to step 3
    fireEvent.click(screen.getByText('Custom Options Component'));
    fireEvent.click(screen.getByText((content) => content.includes('Personal Info Component')));
    
    // Now on step 3, go back to step 2
    fireEvent.click(screen.getByText((content) => content.includes('Additional Information Component'))); // Simulate back step
  
    const personalInfoComponent = await screen.findByText((content) => content.includes('Personal Info Component'));
    expect(personalInfoComponent).toBeInTheDocument();
  });
});
