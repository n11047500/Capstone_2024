import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import CustomisedOrder from '../../src/pages/CustomOrder/CustomisedOrder';
import { CartContext } from '../../src/context/CartContext'; // Import CartContext

// Mock child components
jest.mock('../../src/pages/CustomOrder/customOptions', () => ({ onNext, onChange }) => (
  <div>
    <h1>Custom Options</h1>
    <button onClick={() => {
      onChange({ option: 'Some Option' }); // Mocking data change
      onNext(); // Call onNext to simulate moving to the next step
    }}>Next</button>
  </div>
));

jest.mock('../../src/pages/CustomOrder/personalInfo', () => ({ onNext, onBack, onChange }) => (
  <div>
    <h1>Personal Information</h1>
    <button onClick={() => {
      onChange({ email: 'test@example.com' }); // Mocking data change
      onNext(); // Call onNext to simulate moving to the next step
    }}>Next</button>
    <button onClick={onBack}>Back</button>
  </div>
));

jest.mock('../../src/pages/CustomOrder/additionalInformation', () => ({ onBack, onChange, onSubmit }) => (
  <div>
    <h1>Additional Information</h1>
    <button onClick={() => {
      onChange({ details: 'Some details' }); // Mocking data change
    }}>Change Details</button>
    <button onClick={onBack}>Back</button>
    <button onClick={onSubmit}>Submit</button>
  </div>
));

// Create a mock CartContext.Provider for testing
const mockCart = {
  cart: [], // or whatever initial state you want for the cart
};

const MockCartProvider = ({ children }) => (
  <CartContext.Provider value={mockCart}>{children}</CartContext.Provider>
);


describe('CustomisedOrder Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    global.alert = jest.fn(); // Mock the alert function
  });

  test('renders initial step and navigates to next step', () => {
    render(
      <MemoryRouter>
        <MockCartProvider>
          <CustomisedOrder />
        </MockCartProvider>
      </MemoryRouter>
    );

    // Step 1 should be rendered initially
    const headingElementStep1 = screen.getByRole('heading', { name: /Custom Options/i });
    expect(headingElementStep1).toBeInTheDocument();

    // Click next in Custom Options
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2 should be rendered
    const headingElementStep2 = screen.getByRole('heading', { name: /Personal Information/i });
    expect(headingElementStep2).toBeInTheDocument();
  });

  test('navigates back to previous step', () => {
    render(
      <MemoryRouter>
        <MockCartProvider>
          <CustomisedOrder />
        </MockCartProvider>
      </MemoryRouter>
    );

    // Move to Step 2
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2 should be rendered
    const headingElementStep2 = screen.getByRole('heading', { name: /Personal Information/i });
    expect(headingElementStep2).toBeInTheDocument();


    // Click back to return to Step 1
    fireEvent.click(screen.getByText(/Back/i));

    // Step 1 should be rendered again
    const headingElementStep1 = screen.getByRole('heading', { name: /Custom Options/i });
    expect(headingElementStep1).toBeInTheDocument();
  });

  test('changes form data correctly', () => {
    render(
      <MemoryRouter>
        <MockCartProvider>
          <CustomisedOrder />
        </MockCartProvider>
      </MemoryRouter>
    );

    // Change data in Custom Options and move to next step
    fireEvent.click(screen.getByText(/Next/i));
    // Change data in Personal Information and move to next step
    fireEvent.click(screen.getByText(/Next/i));

    const headingElementStep3 = screen.getByRole('heading', { name: /Additional Information/i });
    expect(headingElementStep3).toBeInTheDocument();
  });

  test('submits form data correctly', async () => {
    // Mock fetch to simulate API call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(
      <MemoryRouter>
        <MockCartProvider>
          <CustomisedOrder />
        </MockCartProvider>
      </MemoryRouter>
    );

    // Navigate through the steps and fill out data
    fireEvent.click(screen.getByText(/Next/i)); // Custom Options
    fireEvent.click(screen.getByText(/Next/i)); // Personal Info
    fireEvent.click(screen.getByText(/Submit/i)); // Submit in Additional Information

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/submit-form'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    expect(global.alert).toHaveBeenCalledWith('Email sent successfully!');
  });

  test('handles submission failure', async () => {
    // Mock fetch to simulate an error response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    );
  
    render(
      <MemoryRouter>
        <MockCartProvider>
          <CustomisedOrder />
        </MockCartProvider>
      </MemoryRouter>
    );
  
    // Navigate through the steps and fill out data
    fireEvent.click(screen.getByText(/Next/i)); // Custom Options
    fireEvent.click(screen.getByText(/Next/i)); // Personal Info
    fireEvent.click(screen.getByText(/Submit/i)); // Submit in Additional Information
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  
    // Use findByText here for the error message
    expect(global.alert).toHaveBeenCalledWith('Failed to send form.');
  });
});