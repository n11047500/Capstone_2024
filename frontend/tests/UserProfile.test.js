import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '../src/pages/UserProfile';

// Mock useParams to simulate dynamic route parameters
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ email: 'test@example.com' }),
}));

// Mock the Header and Footer components since we're not testing them here
jest.mock('../src/components/Header', () => () => <div>Mock Header</div>);
jest.mock('../src/components/Footer', () => () => <div>Mock Footer</div>);

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = mockLocalStorage;

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          first_name: 'John',
          last_name: 'Doe',
          mobile_number: '1234567890',
          date_of_birth: '1990-01-01T00:00:00Z',
          shippingAddress: '123 Main St',
          billingAddress: '123 Main St',
        }),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('UserProfile Component', () => {
  test('renders correctly and fetches user data', async () => {
    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );

    // Check if heading is rendered
    expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();

    // Wait for user data to be fetched and rendered
    expect(await screen.findByText('Welcome, John!')).toBeInTheDocument();

    // Check that form fields are pre-filled with user data
    expect(screen.getByLabelText(/first name:/i)).toHaveValue('John');
    expect(screen.getByLabelText(/last name:/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/mobile number:/i)).toHaveValue('1234567890');
    expect(screen.getByLabelText(/date of birth:/i)).toHaveValue('1990-01-01');
    expect(screen.getByLabelText(/shipping address:/i)).toHaveValue('123 Main St');
    expect(screen.getByLabelText(/billing address:/i)).toHaveValue('123 Main St');
  });

  test('updates form data correctly', async () => {
    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );

    // Wait for user data to load
    await screen.findByLabelText(/first name:/i);

    // Simulate changing the first name field
    fireEvent.change(screen.getByLabelText(/first name:/i), {
      target: { value: 'Jane' },
    });

    // Check that the field has updated
    expect(screen.getByLabelText(/first name:/i)).toHaveValue('Jane');
  });

  test('toggles sameAddress checkbox correctly', async () => {
    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );

    // Wait for user data to load
    await screen.findByLabelText(/shipping address:/i);

    // Initially, billing address should be disabled because it's the same as shipping
    expect(screen.getByLabelText(/billing address:/i)).toBeDisabled();

    // Uncheck "Billing address is the same as shipping address"
    fireEvent.click(screen.getByLabelText(/billing address is the same as shipping address/i));

    // Billing address should now be enabled
    expect(screen.getByLabelText(/billing address:/i)).toBeEnabled();
  });
});
