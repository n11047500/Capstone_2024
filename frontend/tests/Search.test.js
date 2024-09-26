import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Search from '../src/components/Search'; // Adjust the import path as necessary

describe('Search Component', () => {
  const mockOnSearch = jest.fn(); // Mock function for onSearch prop

  test('renders the search input and icon', () => {
    render(<Search onSearch={mockOnSearch} />);
    // Check if the input field is rendered
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();

    // Check if the search icon is rendered using data-testid
    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  test('updates the input value correctly', () => {
    render(<Search onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Search...');

    // Simulate user typing in the input field
    fireEvent.change(input, { target: { value: 'test query' } });

    // Check if the input value is updated
    expect(input.value).toBe('test query');
  });

  test('calls onSearch with the correct query when the search icon is clicked', () => {
    render(<Search onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Search...');

    // Simulate user typing in the input field
    fireEvent.change(input, { target: { value: 'test query' } });

    // Simulate clicking the search icon using data-testid
    const searchIcon = screen.getByTestId('search-icon');
    fireEvent.click(searchIcon);

    // Check if onSearch was called with the correct argument
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });
});
