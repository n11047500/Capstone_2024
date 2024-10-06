import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderManagement from '../pages/OrderManagement';

global.fetch = jest.fn();

describe('OrderManagement', () => {
  beforeEach(() => {
    // Clear all instances and calls to the mock function
    fetch.mockClear();
  });

  test('should fetch and display orders based on the status filter', async () => {
    // Mock the fetch response with a single order
    const mockOrders = [
      {
        Order_ID: 8041,
        First_Name: 'Joyal',
        Last_Name: 'Vincent',
        Email: 'test@gmail.com',
        status: 'Pending'
      }
    ];
  
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        json: () => Promise.resolve(mockOrders),
      })
    );
  
    render(<OrderManagement setActiveForm={jest.fn()} />);
  
    // Expect the loading state to be true
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
    // Wait for loading to finish and the table to appear
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(1);
      // Check for the unique identifier of the single order
      expect(screen.getByText('8041')).toBeInTheDocument();
      expect(screen.getByText('test@gmail.com')).toBeInTheDocument(); // Check email as well
    });
  });
  
  

  test('Order Management shows an error if API call fails', async () => {
    // Mock failed API response
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API call failed')));

    // Render the component
    render(<OrderManagement />);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch orders. Please try again later.')).toBeInTheDocument();
    });
  });
});



