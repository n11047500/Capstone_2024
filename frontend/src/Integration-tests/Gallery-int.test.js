import React from 'react'; 
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Gallery from '../pages/Gallery';
import { CartProvider } from '../context/CartContext';
import { BrowserRouter as Router } from 'react-router-dom';

import gallery10 from '../assets/gallery/gallery10.jpg';
import gallery5 from '../assets/gallery/gallery5.jpg';
import gallery14 from '../assets/gallery/gallery14.jpg';

// Mocking the reCAPTCHA component
jest.mock('react-google-recaptcha', () => {
  return function DummyReCAPTCHA({ onChange }) {
    return <button onClick={() => onChange('mockToken')}>Verify CAPTCHA</button>;
  };
});

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Utility function to render with CartProvider and Router
const renderWithCartProvider = (ui, { value, ...renderOptions } = {}) => {
  return render(
    <CartProvider>
      <Router>{ui}</Router>
    </CartProvider>,
    renderOptions
  );
};

describe('Gallery Component Integration Test', () => { 
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  // test ensures that the gallery images appear within the gallery page
  test('displays gallery images correctly', () => {
    renderWithCartProvider(<Gallery />);
    
    // Check if the images are rendered with the correct alt text
    const img1 = screen.getAllByAltText('gallery1')[0];
    const img2 = screen.getAllByAltText('gallery2')[0];
    const img3 = screen.getAllByAltText('gallery3')[0];
    
    expect(img1).toBeInTheDocument();
    expect(img2).toBeInTheDocument();
    expect(img3).toBeInTheDocument();
  });
  // ensures users can click the '<' and '>' buttons to navigate through the gallery images
  test('displays and handles click event for images and navigates through modal', () => {
    renderWithCartProvider(<Gallery />);
  
    // Verify the images are displayed correctly
    const img10 = screen.getByAltText('gallery10');
    const img5 = screen.getByAltText('gallery5');
    const img14 = screen.getByAltText('gallery14');
  
    expect(img10).toBeInTheDocument();
    expect(img5).toBeInTheDocument();
    expect(img14).toBeInTheDocument();
  
    // Simulate clicking the first image (gallery10)
    fireEvent.click(img10);
    let modalImage = screen.getByAltText('Selected');
    expect(modalImage).toBeInTheDocument();
    expect(modalImage).toHaveAttribute('src', gallery10); // Ensure the first image is displayed
  
    // Simulate clicking right to go to the next image (gallery5)
    fireEvent.click(screen.getByText('>')); // Assuming you have a button for right navigation
    modalImage = screen.getByAltText('Selected');
    expect(modalImage).toHaveAttribute('src', gallery5); // Check that it navigates to gallery5
  
    // Simulate clicking right again to go to the next image (gallery14)
    fireEvent.click(screen.getByText('>')); // Click right again
    modalImage = screen.getByAltText('Selected');
    expect(modalImage).toHaveAttribute('src', gallery14); // Check that it navigates to gallery14
  
    // Simulate clicking left to go back to gallery5
    fireEvent.click(screen.getByText('<')); // Assuming you have a button for left navigation
    modalImage = screen.getByAltText('Selected');
    expect(modalImage).toHaveAttribute('src', gallery5); // Check that it returns to gallery5
  
    // Simulate clicking left again to go back to gallery10
    fireEvent.click(screen.getByText('<')); // Click left again
    modalImage = screen.getByAltText('Selected');
    expect(modalImage).toHaveAttribute('src', gallery10); // Check that it returns to gallery10
  });

});