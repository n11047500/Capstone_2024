import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Needed for routing
import ProductCard from '../../src/components/ProductCard'; // Adjust the import path as necessary

describe('ProductCard Component', () => {
  const mockProduct = {
    productId: '1',
    title: 'Test Product',
    price: '$10.00',
    image: 'http://example.com/test-product.jpg',
  };

  test('renders the product card with correct information', () => {
    render(
      <MemoryRouter>
        <ProductCard {...mockProduct} />
      </MemoryRouter>
    );

    // Check if the product title is rendered
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();

    // Check if the product price is rendered
    expect(screen.getByText(mockProduct.price)).toBeInTheDocument();

    // Check if the product image is rendered
    const image = screen.getByAltText(mockProduct.title);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProduct.image); // Check if image src matches
  });

  test('renders without image when image prop is not provided', () => {
    const { title, price } = mockProduct;
    
    render(
      <MemoryRouter>
        <ProductCard productId="2" title={title} price={price} /> {/* No image prop */}
      </MemoryRouter>
    );

    // Check if the product title and price are rendered
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(price)).toBeInTheDocument();

    // Check that the image is not rendered
    const image = screen.queryByAltText(title); // Use queryBy to check for absence
    expect(image).not.toBeInTheDocument();
  });

  test('navigates to correct product link', () => {
    render(
      <MemoryRouter>
        <ProductCard {...mockProduct} />
      </MemoryRouter>
    );

    // Check if the link is correct
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/product/${mockProduct.productId}`);
  });
});
