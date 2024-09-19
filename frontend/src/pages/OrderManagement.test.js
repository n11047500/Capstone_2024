import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OrderManagement from './OrderManagement';

// Mock the fetch API for orders and order details
global.fetch = jest.fn();

const mockOrders = [
  { Order_ID: 1, status: 'Pending', Order_Type: 'Delivery', First_Name: 'John', Total_Amount: 100.50 },
  { Order_ID: 2, status: 'Pending', Order_Type: 'Click and Collect', First_Name: 'Jane', Total_Amount: 75.00 }
];

const mockOrderDetails = {
  Order_ID: 1,
  Order_Type: 'Delivery',
  First_Name: 'John',
  Total_Amount: 100.50,
  products: [
    { Product_ID: 1, Product_Name: 'Mini Standard Planter Box', Product_Image_URL: 'image_url_1', Product_Price: 50, option: 'Large' },
    { Product_ID: 2, Product_Name: 'Small Standard Planter Box', Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624910/small_standard_planter_box_j0ogy8.jpg', Product_Price: 265, option: 'Surf' }
  ]
};

// Setup and teardown for fetch mock
beforeEach(() => {
  fetch.mockImplementation((url) => {
    if (url.includes('/orders?status=Pending')) {
      return Promise.resolve({
        json: () => Promise.resolve(mockOrders),
      });
    } else if (url.includes('/orders/1')) {
      return Promise.resolve({
        json: () => Promise.resolve(mockOrderDetails),
      });
    }
    return Promise.reject('API call failed');
  });
});

afterEach(() => {
  fetch.mockClear();
});

test('Order Management displays and fetches orders correctly', async () => {
  // Render the component
  render(<OrderManagement />);

  // Wait for the orders to be fetched and displayed
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  // Simulate clicking on the first order
  fireEvent.click(screen.getByText('John'));

  // Wait for order details to load and check the fetched product details
  await waitFor(() => {
    expect(screen.getByText('Planter Box')).toBeInTheDocument();
    expect(screen.getByText('Garden Tool')).toBeInTheDocument();
  });

  // Test if total amount and product prices are displayed
  expect(screen.getByText('$50.00')).toBeInTheDocument();
  expect(screen.getByText('$100.50')).toBeInTheDocument();
});

test('Order Management handles order status updates', async () => {
  // Render the component
  render(<OrderManagement />);

  // Wait for the orders to load
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  // Click on the first order to load details
  fireEvent.click(screen.getByText('John'));

  // Simulate clicking the "Mark as Completed" button
  const confirmation = jest.spyOn(window, 'confirm').mockImplementation(() => true);
  fetch.mockResolvedValueOnce({ ok: true });

  fireEvent.click(screen.getByText('Mark as Completed'));

  // Verify if the order status update API was called
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'Completed' }),
      })
    );
  });

  // Ensure the status update is reflected in the UI
  await waitFor(() => {
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  confirmation.mockRestore();
});

test('Order Management shows an error if API call fails', async () => {
  // Mock failed API response
  fetch.mockImplementationOnce(() => Promise.reject('API call failed'));

  // Render the component
  render(<OrderManagement />);

  // Wait for the error message
  await waitFor(() => {
    expect(screen.getByText('Failed to fetch orders. Please try again later.')).toBeInTheDocument();
  });
});
