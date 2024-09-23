// AboutUs.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutUs from '../src/pages/AboutUs';
import '@testing-library/jest-dom'; // for the additional matchers

// Mock the Header and Footer components since we're not testing them here
jest.mock('../src/components/Header', () => () => <div>Mock Header</div>);
jest.mock('../src/components/Footer', () => () => <div>Mock Footer</div>);

// Mock the image import
jest.mock('../src/assets/aboutus_image.jpg', () => 'aboutus_image.jpg');

describe('AboutUs Page', () => {
  test('renders the AboutUs page with header, footer, and content', () => {
    render(<AboutUs />);

    // Check if the Header is rendered
    expect(screen.getByText('Mock Header')).toBeInTheDocument();

    // Check if the "About Us" text is rendered
    expect(screen.getByText(/ABOUT US/i)).toBeInTheDocument();

    // Check if the "Who Are We?" heading is rendered
    expect(screen.getByText(/Who Are We\?/i)).toBeInTheDocument();

    // Check if the correct paragraph text is rendered
    expect(screen.getByText(/We are a small, family run business/i)).toBeInTheDocument();

    // Check if the image is rendered with the correct alt text
    const aboutImage = screen.getByAltText('Planter Box in Location');
    expect(aboutImage).toBeInTheDocument();
    expect(aboutImage).toHaveAttribute('src', 'aboutus_image.jpg');

    // Check if the Footer is rendered
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
  });
});
