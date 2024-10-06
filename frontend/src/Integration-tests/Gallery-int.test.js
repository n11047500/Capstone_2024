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

// Mock image imports
jest.mock('../path/to/your/images/gallery1.jpg', () => 'gallery1.jpg');
jest.mock('../path/to/your/images/gallery2.jpg', () => 'gallery2.jpg');
jest.mock('../path/to/your/images/gallery3.jpg', () => 'gallery3.jpg');

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

  test('handles image click event and changes slide', () => { 
    const images = [
      'gallery1.jpg',
      'gallery2.jpg',
      'gallery3.jpg',
    ];
    
    renderWithCartProvider(<Gallery images={images} />); // Render the Gallery component
  
    // Click the first image
    const firstImage = screen.getByAltText('gallery1');
    fireEvent.click(firstImage);
  
    // Check if the modal displays the first image
    const modalImage = screen.getByAltText('Selected'); 
    expect(modalImage).toBeInTheDocument(); 
    expect(modalImage).toHaveAttribute('src', 'gallery1.jpg'); 
  
    // Now click the next button to change to the second image
    const nextButton = screen.getByRole('button', { name: '>' }); // Ensure this matches your button's role and name
    fireEvent.click(nextButton);
  
    // Re-fetch the modal image after clicking the next button
    const updatedModalImage = screen.getByAltText('Selected'); 
  
    // Check if the modal now displays the second image
    expect(updatedModalImage).toHaveAttribute('src', 'gallery2.jpg'); // Expect it to change to the second image
  });
  

});