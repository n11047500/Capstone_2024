import React from 'react';
import { render, screen, fireEvent , waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header'; 
import { CartContext } from '../context/CartContext';

// Mock navigate function from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Header Integration Tests', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock the navigate function
    const { useNavigate } = require('react-router-dom');
    useNavigate.mockImplementation(() => mockNavigate);
  });

  const renderWithProviders = (cartItems = [], userEmail = null) => {
    // Mock localStorage for userEmail
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      return key === 'userEmail' ? userEmail : null;
    });

    // Render the component with MemoryRouter and CartContext
    return render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: cartItems }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );
  };

  test('Render Header with the logo, cart, and user icon', () => {
    renderWithProviders();
    
    // Check if logo is present
    expect(screen.getByAltText('EZee Planter Boxes')).toBeInTheDocument();

    // Check if user icon is present
    expect(screen.getByAltText('User Icon')).toBeInTheDocument();

    // Check if shopping cart icon is present
    expect(screen.getByAltText('Shopping Cart')).toBeInTheDocument();
  });

  test('Show login and signup when user is not logged in', () => {
    // Clear any existing user data from localStorage to simulate a logged-out user
    localStorage.removeItem('userEmail');
  
    // Render the Header component
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: [] }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );
  
    // Open the dropdown by clicking on the user icon
    fireEvent.click(screen.getByTestId('user-icon'));
  
    // Wait for the dropdown menu to be visible
    const dropdownMenu = screen.getByTestId('dropdown-menu');
    expect(dropdownMenu).toBeVisible();
  
    // Ensure the "Login" link is present when the user is logged out
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
  
    // Ensure the "Sign Up" link is present when the user is logged out
    const signUpLink = screen.getByRole('link', { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
  });

  

  test('Show profile and logout when user is logged in', () => {
    renderWithProviders([], 'testuser@example.com');

    // Click on the user icon to open the dropdown
    fireEvent.click(screen.getByAltText('User Icon'));

    // Check if profile and logout links are visible
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/log out/i)).toBeInTheDocument();
  });


  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem(key) {
          return store[key] || null;
        },
        setItem(key, value) {
          store[key] = value.toString();
        },
        clear() {
          store = {};
        },
        removeItem(key) {
          delete store[key];
        }
      };
    })();
  
    // Assign the mock to window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  
    // Set the user as logged in by adding their email to localStorage
    localStorage.setItem('userEmail', 'testuser@example.com');
  });

  test('Should navigate to home page when logout is clicked', async () => {
    // Simulate a logged-in user by setting localStorage
    localStorage.setItem('userEmail', 'testuser@example.com');
  
    // Render the Header component
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: [] }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );
  
    // Verify that the user is logged in (email exists in localStorage)
    expect(localStorage.getItem('userEmail')).toBe('testuser@example.com');
  
    // Open the dropdown by clicking on the user icon
    fireEvent.click(screen.getByTestId('user-icon'));
  
    // Wait for the dropdown menu to be visible
    await waitFor(() => expect(screen.getByTestId('dropdown-menu')).toBeVisible());
  
    // Ensure the "Log Out" button is present since the user is logged in
    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
  
    // Click the "Log Out" button
    fireEvent.click(logoutButton);
  
    // Wait for localStorage to be cleared (user logged out)
    await waitFor(() => expect(localStorage.getItem('userEmail')).toBeNull());
  
    // Ensure the user is redirected to the homepage
    expect(window.location.pathname).toBe('/');
  });
  
  
  
  
  

  test('Show correct cart item count', () => {
    const cartItems = [
      { Product_ID: 1, Product_Name: 'Item 1', quantity: 3 },
      { Product_ID: 2, Product_Name: 'Item 2', quantity: 2 },
    ];

    renderWithProviders(cartItems);

    // Check if cart counter shows correct number of items
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('Opens and closes the sidebar when the menu icon is clicked', async () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cart: [] }}>
          <Header />
        </CartContext.Provider>
      </MemoryRouter>
    );
  
    // Click to open the sidebar
    const menuIcon = screen.getByText('☰');
    fireEvent.click(menuIcon);
  
    // Expect sidebar to be opened (check if the 'Browse' link is visible inside the sidebar)
    const browseLink = screen.getByText(/browse/i);
    expect(browseLink).toBeInTheDocument(); // Sidebar is opened
  
    // Click to close the sidebar
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
  
    // Assert that the sidebar no longer has the 'open' class
    const sidebar = screen.getByTestId('sidebar'); // Use the test id
    expect(sidebar).not.toHaveClass('open'); // Sidebar is closed
  });
  
});
