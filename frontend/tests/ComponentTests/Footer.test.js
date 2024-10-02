import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../../src/components/Footer'; // Adjust the import path as necessary
import { MemoryRouter } from 'react-router-dom';

// Mock image imports
jest.mock('../assets/logo.png', () => 'test-file-stub');
jest.mock('../assets/ezeeind.png', () => 'test-file-stub');
jest.mock('../assets/ezeefencing.png', () => 'test-file-stub');

describe('Footer Component', () => {
  test('renders the footer logo with correct alt text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const logoImg = screen.getByAltText(/EZee Planter Boxes/i);
    expect(logoImg).toHaveAttribute('src', 'test-file-stub'); // Expect the mocked value
  });

  test('renders the footer description', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const description = screen.getByText(/Ranging from mini garden size right through to our large garden,/i);
    expect(description).toBeInTheDocument();
  });

  test('renders Explore section with correct links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const exploreHeader = screen.getByRole('heading', { name: /Explore/i });
    expect(exploreHeader).toBeInTheDocument();

    // Test for each link in the Explore section
    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    const shoppingLink = screen.getByRole('link', { name: /Shopping/i });
    expect(shoppingLink).toHaveAttribute('href', '/browse');

    const aboutUsLink = screen.getByRole('link', { name: /About Us/i });
    expect(aboutUsLink).toHaveAttribute('href', '/aboutus');

    const galleryLink = screen.getByRole('link', { name: /Gallery/i });
    expect(galleryLink).toHaveAttribute('href', '/gallery');

    const contactUsLink = screen.getByRole('link', { name: /Contact Us/i });
    expect(contactUsLink).toHaveAttribute('href', '/contactus');
  });

  test('renders Contact Us section with correct information', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const contactHeader = screen.getByRole('heading', { name: /Contact Us/i });
    expect(contactHeader).toBeInTheDocument();

    const address = screen.getByText(/21 Huntington Street,/i);
    expect(address).toBeInTheDocument();

    const phoneLink = screen.getByRole('link', { name: /07 3284 8180/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:0732848180'); // Check phone link

    const emailLink = screen.getByRole('link', { name: /info@ezeeplanters.com.au/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:info@ezeeplanters.com.au'); // Check email link
  });

  test('renders Other EZee Businesses section with images', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const businessesHeader = screen.getByText(/Other EZee Businesses/i);
    expect(businessesHeader).toBeInTheDocument();

    const ezeeIndImage = screen.getByAltText(/EZee Industries/i);
    expect(ezeeIndImage).toBeInTheDocument();
    const ezeeIndLink = screen.getByRole('link', { name: /EZee Industries/i });
    expect(ezeeIndLink).toHaveAttribute('href', 'https://www.ezeeindustries.com.au');

    const ezeeFencingImage = screen.getByAltText(/EZee Fencing/i);
    expect(ezeeFencingImage).toBeInTheDocument();
    const ezeeFencingLink = screen.getByRole('link', { name: /EZee Fencing/i });
    expect(ezeeFencingLink).toHaveAttribute('href', 'https://www.ezeefencing.com.au');
  });
});
