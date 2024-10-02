import React from 'react'; 
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Gallery from '../pages/Gallery';
import { CartProvider } from '../context/CartContext';
import { BrowserRouter as Router } from 'react-router-dom';

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

  test('handles image click event', () => {
    const handleClick = jest.fn();
    const images = [
      { id: 1, src: 'gallery1.jpg', alt: 'gallery1' },
      { id: 2, src: 'gallery2.jpg', alt: 'gallery2' },
      { id: 3, src: 'gallery3.jpg', alt: 'gallery3' },
      { id: 4, src: 'gallery1.jpg', alt: 'gallery1' }, // Duplicate entry for testing
    ];
    
    renderWithCartProvider(<Gallery images={images} />); // No onImageClick here since we cannot change the component
  
    const imgElements = screen.getAllByAltText('gallery1'); // Get all images with the alt text 'gallery1'
    fireEvent.click(imgElements[0]); // Click the first image with alt text 'gallery1'
  
    // Instead of checking for handleClick, we will check if the modal opens 
    // and we can mock the state changes instead. 
    const modalImage = screen.getByAltText('Selected'); // Ensure that the modal content appears
    expect(modalImage).toBeInTheDocument(); // Check if the modal is displayed
    expect(modalImage).toHaveAttribute('src', images[0].src); // Check if the correct image is displayed in the modal
  });
  
});
