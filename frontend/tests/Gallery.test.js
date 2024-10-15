import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Gallery from '../src/pages/Gallery';

// Mock the Header and Footer components since we're not testing them here
jest.mock('../src/components/Header', () => () => <div>Mock Header</div>);
jest.mock('../src/components/Footer', () => () => <div>Mock Footer</div>);

describe('Gallery Component', () => {
  test('renders Gallery component', () => {
    render(<Gallery />);
    
    // Check for the presence of the title and subtitle
    expect(screen.getByText(/Gallery/i)).toBeInTheDocument();
    expect(screen.getByText(/Locally designed and manufactured/i)).toBeInTheDocument();
  });

  test('opens modal when an image is clicked', () => {
    render(<Gallery />);
    
    // Find the first image and click it
    const image = screen.getAllByRole('img')[0]; // Get all images
    fireEvent.click(image);

    // Check if the modal opens
    expect(screen.getByAltText(/Selected/i)).toBeInTheDocument();
  });

  test('closes modal when clicked', () => {
    render(<Gallery />);
    
    // Find and click the first image to open the modal
    const image = screen.getAllByRole('img')[0];
    fireEvent.click(image);

    // Click the modal to close it
    const modal = screen.getByRole('img', { name: /Selected/i });
    fireEvent.click(modal);

    // Check if the modal is closed (the selected image should not be in the document)
    expect(screen.queryByAltText(/Selected/i)).not.toBeInTheDocument();
  });
});
