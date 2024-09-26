import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OrderManagement from './OrderManagement';

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
        Email: 'joyalvincentofficial@gmail.com',
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
      expect(screen.getByText('joyalvincentofficial@gmail.com')).toBeInTheDocument(); // Check email as well
    });
  });
  
  test('Order Management handles order status updates', async () => {
    // Mock initial fetch response for orders
    const mockOrders = [
      {
        Order_ID: 8041,
        First_Name: 'Joyal',
        Last_Name: 'Vincent',
        Email: 'joyalvincentofficial@gmail.com',
        status: 'Pending',
      },
    ];
  
    // Mock fetch for orders
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockOrders),
      })
    );
  
    render(<OrderManagement setActiveForm={jest.fn()} />);
  
    // Wait for loading to finish and for the orders to be rendered
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('View Details')).toBeInTheDocument());
  
    // Simulate click on "View Details"
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
  
    // Mock fetch response for order details
    const orderDetails = {
      Order_ID: 8041,
      products: [], // Assuming you have a products array in the response
      status: 'Completed', // New status after update
    };
  
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(orderDetails),
      })
    );
  
    // Wait for the order details to be displayed
    await waitFor(() =>
      expect(screen.getByText(/Customer: Joyal Vincent/i)).toBeInTheDocument() // Use regex directly here
    );
  
    // Simulate a change in status, which would trigger a PUT request
    const markAsCompletedButton = screen.getByText('Mark as Completed'); // Updated button text
    fireEvent.click(markAsCompletedButton);
  
    // Mock fetch response for updating order status
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true, // Simulate a successful response for the PUT request
      })
    );
  
    // Wait for the fetch calls to be completed
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  
    // Assert that the order status has been updated in the UI
    await waitFor(() =>
      expect(screen.getByText(/Completed/i)).toBeInTheDocument()
    );
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




// // Mock the fetch API for orders and order details
// global.fetch = jest.fn(() =>
//     Promise.resolve({
//       json: () => Promise.resolve([]),
//     })
//   );
// const mockOrders = [
//   { Order_ID: 1, status: 'Pending', Order_Type: 'Delivery', First_Name: 'John', Total_Amount: 100.50 },
//   { Order_ID: 2, status: 'Pending', Order_Type: 'Click and Collect', First_Name: 'Jane', Total_Amount: 75.00 }
// ];

// const mockOrderDetails = {
//   Order_ID: 1,
//   Order_Type: 'Delivery',
//   First_Name: 'John',
//   Total_Amount: 100.50,
//   products: [
//     { Product_ID: 1, Product_Name: 'Mini Standard Planter Box', Product_Image_URL: 'image_url_1', Product_Price: 50, option: 'Large' },
//     { Product_ID: 2, Product_Name: 'Small Standard Planter Box', Product_Image_URL: 'https://res.cloudinary.com/dakwlrcqr/image/upload/v1723624910/small_standard_planter_box_j0ogy8.jpg', Product_Price: 265, option: 'Surf' }
//   ]
// };

// // Setup and teardown for fetch mock
// beforeEach(() => {
//   fetch.mockImplementation((url) => {
//     if (url.includes('/orders?status=Pending')) {
//       return Promise.resolve({
//         json: () => Promise.resolve(mockOrders),
//       });
//     } else if (url.includes('/orders/1')) {
//       return Promise.resolve({
//         json: () => Promise.resolve(mockOrderDetails),
//       });
//     }
//     return Promise.reject('API call failed');
//   });
// });

// afterEach(() => {
//   fetch.mockClear();
// });

// test('displays orders after fetching', async () => {
//     render(<OrderManagement setActiveForm={() => {}} />);
  
//     // Expect loading to show up first
//     expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
//     // Wait for the orders to be fetched and rendered
//     await waitFor(() => expect(screen.getByText(/Order_ID: 8041/i)).toBeInTheDocument());
//   });

  