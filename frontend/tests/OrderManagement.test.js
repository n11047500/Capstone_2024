// OrderManagement.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderManagement from '../src/pages/OrderManagement'; // Adjust the import path as needed

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // Default to empty orders
  })
);

describe('OrderManagement Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the component correctly', () => {
    render(<OrderManagement setActiveForm={jest.fn()} />);
    expect(screen.getByText(/Order Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument(); // Loading state
  });

  it('fetches and displays orders on load', async () => {
    // Mock orders data
    const orders = [
      {
        Order_ID: '1',
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john@example.com',
        status: 'Pending',
      },
    ];

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(orders),
      })
    );

    render(<OrderManagement setActiveForm={jest.fn()} />);

    // Wait for the orders to be displayed
    await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  it('handles order status change', async () => {
    const orders = [
      {
        Order_ID: '1',
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john@example.com',
        status: 'Pending',
      },
    ];

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(orders),
      })
    );

    render(<OrderManagement setActiveForm={jest.fn()} />);

    // Wait for the orders to be displayed
    await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());

    // Click the button to view order details
    fireEvent.click(screen.getByText(/View Details/i));

    // Mock API for updating order status
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    // Confirm and change the order status
    window.confirm = jest.fn(() => true);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Completed' } });
    fireEvent.click(screen.getByText(/Confirm/i));

    await waitFor(() => expect(screen.getByText(/Completed/i)).toBeInTheDocument());
  });

  it('sends an email after order status change', async () => {
    const orders = [
      {
        Order_ID: '1',
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john@example.com',
        status: 'Pending',
        Order_Type: 'Delivery',
        products: [
          {
            Product_Name: 'Sample Product',
            Product_Image_URL: 'http://example.com/image.jpg',
            Product_Price: 100,
          },
        ],
      },
    ];

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(orders),
      })
    );

    render(<OrderManagement setActiveForm={jest.fn()} />);

    // Wait for the orders to be displayed
    await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());

    // Click the button to view order details
    fireEvent.click(screen.getByText(/View Details/i));

    // Mock email sending
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    // Confirm and change the order status
    window.confirm = jest.fn(() => true);
    window.prompt = jest.fn(() => '123456'); // Mock tracking number input
    fireEvent.click(screen.getByText(/Mark as Completed/i));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Email sent successfully!'));
  });

  it('handles fetch errors gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Fetch error')));

    render(<OrderManagement setActiveForm={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/Failed to fetch orders/i)).toBeInTheDocument());
  });
});
