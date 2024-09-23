// AddProduct.test.js
import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import AddProduct from '../src/pages/AddProduct';

describe('AddProduct Component', () => {
  beforeEach(() => {
    // Mocking the fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form elements', () => {
    render(<AddProduct />);
    
    expect(screen.getByLabelText(/Product Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Price:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity Available:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Width \(mm\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Depth \(mm\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height \(mm\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Options:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Image URL:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Product/i })).toBeInTheDocument();
  });

  test('handles input changes correctly', () => {
    render(<AddProduct />);

    fireEvent.change(screen.getByLabelText(/Product Name:/i), { target: { value: 'Test Product' } });
    expect(screen.getByLabelText(/Product Name:/i).value).toBe('Test Product');

    fireEvent.change(screen.getByLabelText(/Image URL:/i), { target: { value: 'http://example.com/image.jpg' } });
    expect(screen.getByLabelText(/Image URL:/i).value).toBe('http://example.com/image.jpg');
    expect(screen.getByAltText(/Product Preview/i)).toHaveAttribute('src', 'http://example.com/image.jpg');
  });

  test('submits the form and displays success message', async () => {
    render(<AddProduct />);

    fireEvent.change(screen.getByLabelText(/Product Name:/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Product Price:/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Quantity Available:/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Width \(mm\):/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Depth \(mm\):/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Height \(mm\):/i), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    expect(await screen.findByText(/Product added successfully/i)).toBeInTheDocument();
  });

  test('displays error message when submission fails', async () => {
    // Simulate a failed fetch
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to add product.' }),
      })
    );

    render(<AddProduct />);

    fireEvent.change(screen.getByLabelText(/Product Name:/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Product Price:/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    expect(await screen.findByText(/Failed to add product./i)).toBeInTheDocument();
  });
});
