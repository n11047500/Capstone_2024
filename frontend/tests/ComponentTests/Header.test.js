import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../src/context/CartContext';
import Header from '../../src/components/Header';

// Mocking CartContext to provide test data
const mockCart = [
  { id: 1, name: 'Product 1', quantity: 2 },
  { id: 2, name: 'Product 2', quantity: 3 },
];

// Mock the user email in localStorage
const mockEmail = 'testuser@example.com';
beforeEach(() => {
  localStorage.setItem('userEmail', mockEmail);
});

afterEach(() => {
  localStorage.removeItem('userEmail');
});

// Mock the useNavigate hook
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Header Component', () => {
  test('renders the logo with correct alt text', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: mockCart }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );

    const logoImg = screen.getByAltText(/EZee Planter Boxes/i);
    expect(logoImg).toBeInTheDocument();
  });

  test('toggles sidebar when menu icon is clicked', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: mockCart }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );
  
    const menuIcon = screen.getByText('☰'); // Click the menu icon to open the sidebar
    fireEvent.click(menuIcon);
  
    // Find the sidebar navigation using the aria-label
    const sidebar = screen.getByRole('navigation', { name: /sidebar navigation/i });
    expect(sidebar).toHaveClass('open'); // Check if sidebar is open
  
    const closeButton = screen.getByRole('button', { name: /×/i });
    fireEvent.click(closeButton);
    expect(sidebar).not.toHaveClass('open'); // Ensure sidebar is closed
  });

  test('renders user icon and toggles dropdown menu', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: mockCart }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );

    const userIcon = screen.getByAltText(/User Icon/i);
    fireEvent.click(userIcon);

    // Check if dropdown menu is displayed
    const profileLink = screen.getByRole('link', { name: /Profile/i });
    expect(profileLink).toBeInTheDocument();

    const logoutButton = screen.getByText(/Log Out/i);
    expect(logoutButton).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(userIcon);
    expect(screen.queryByRole('link', { name: /Profile/i })).not.toBeInTheDocument();
  });

  test('renders shopping cart icon with correct item count', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: mockCart }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );

    const cartIcon = screen.getByAltText(/Shopping Cart/i);
    expect(cartIcon).toBeInTheDocument();

    const cartCounter = screen.getByText(/5/i); // Total quantity from mockCart (2 + 3)
    expect(cartCounter).toBeInTheDocument();
  });

  test('handles logout and redirects to home', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: mockCart }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );

    const userIcon = screen.getByAltText(/User Icon/i);
    fireEvent.click(userIcon);

    const logoutButton = screen.getByText(/Log Out/i);
    fireEvent.click(logoutButton);

    expect(localStorage.getItem('userEmail')).toBeNull(); // Check that userEmail is removed
    expect(mockNavigate).toHaveBeenCalledWith('/'); // Ensure navigation to home
  });
});
