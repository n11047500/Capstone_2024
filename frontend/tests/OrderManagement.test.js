import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { groupProducts } from '../src/pages/OrderManagement';
import OrderManagement from '../src/pages/OrderManagement';

global.fetch = jest.fn();

describe('groupProducts', () => {
  const productDetails = [
    { Product_ID: '101', Product_Price: '100', Product_Name: 'Product A', Product_Image_URL: 'http://example.com/imageA.jpg' },
    { Product_ID: '102', Product_Price: '50', Product_Name: 'Product B', Product_Image_URL: 'http://example.com/imageB.jpg' },
  ];

  test('should group products by ID and option', () => {
    const productIds = '101:Default, 102:Custom';

    const result = groupProducts(productIds, productDetails);

    expect(result).toEqual([
      {
        productId: '101',
        option: 'Default',
        quantity: 1,
        Product_Price: '100',
        Product_Name: 'Product A',
        Product_Image_URL: 'http://example.com/imageA.jpg',
        totalPrice: 100,
      },
      {
        productId: '102',
        option: 'Custom',
        quantity: 1,
        Product_Price: '50',
        Product_Name: 'Product B',
        Product_Image_URL: 'http://example.com/imageB.jpg',
        totalPrice: 50,
      },
    ]);
  });

  test('should handle multiple quantities of the same product', () => {
    const productIds = '101:Default, 101:Default, 102:Custom';

    const result = groupProducts(productIds, productDetails);

    expect(result).toEqual([
      {
        productId: '101',
        option: 'Default',
        quantity: 2,
        Product_Price: '100',
        Product_Name: 'Product A',
        Product_Image_URL: 'http://example.com/imageA.jpg',
        totalPrice: 200,
      },
      {
        productId: '102',
        option: 'Custom',
        quantity: 1,
        Product_Price: '50',
        Product_Name: 'Product B',
        Product_Image_URL: 'http://example.com/imageB.jpg',
        totalPrice: 50,
      },
    ]);
  });

  test('should return an empty array if no product details are provided', () => {
    const productIds = '101:Default';
    
    const result = groupProducts(productIds, []);
    
    expect(result).toEqual([]);
  });

  test('should handle invalid product IDs gracefully', () => {
    const productIds = '999:Default';  // Product ID 999 does not exist in productDetails
    
    const result = groupProducts(productIds, productDetails);
    
    expect(result).toEqual([]);  // No matching product should result in an empty array
  });
});

describe('OrderManagement', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders order list with mock data', async () => {
    const mockOrders = [
      {
        Order_ID: '1',
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john.doe@example.com',
        status: 'Pending',
      },
    ];

    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockOrders),
    });

    render(<OrderManagement setActiveForm={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const pendingElements = screen.getAllByText(/Pending/i);
      expect(pendingElements).toHaveLength(2); // Assuming there are two "Pending" texts
    });

    await waitFor(() => {
      const pendingElements = screen.getAllByText(/Pending/i);
      expect(pendingElements[1]).toBeInTheDocument(); // Verify the second one is present    
    });
  });

  test('displays order details when View Details is clicked', async () => {
    const mockOrder = {
      Order_ID: '1',
      First_Name: 'John',
      Last_Name: 'Doe',
      Email: 'john.doe@example.com',
      Mobile: '1234567890',
      Order_Type: 'Delivery',
      Order_Date: '2024-01-01',
      Total_Amount: '100',
      products: [
        {
          Product_ID: '101',
          Product_Name: 'Test Product',
          Product_Price: '100',
          Product_Image_URL: 'http://example.com/image.jpg',
          option: 'Default',
          quantity: 1, // Ensure quantity is part of the product object
        },
      ],
    };
  
    // Mock the fetch call to return the mock order
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce([mockOrder]), // For fetching the orders list
    });
  
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockOrder), // For fetching order details
    });
  
    // Render the OrderManagement component
    render(<OrderManagement setActiveForm={jest.fn()} />);
  
    // Wait for the customer name to be rendered
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  
    // Click the View Details button
    fireEvent.click(screen.getByText(/View Details/i));
  
    // Wait for the order details header to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Order Details for Order #1/i)).toBeInTheDocument();
    });
  
    // Optional: You can also check for other details to ensure they are displayed correctly
    expect(screen.getByText(/Email:/i)).toHaveTextContent('john.doe@example.com');
    expect(screen.getByText(/Total Amount:/i)).toHaveTextContent('$100');
    expect(screen.getByText(/Delivery/i)).toBeInTheDocument();
  });

  test('handles error when fetching orders fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch orders'));

    render(<OrderManagement setActiveForm={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch orders/i)).toBeInTheDocument();
    });
  });

  test('marks an order as completed', async () => {
    // Mocking API responses
    const mockOrders = [
      {
        Order_ID: 1,
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john@example.com',
        status: 'Pending',
        Order_Type: 'Delivery',
        Mobile: '1234567890',
        Total_Amount: 100,
        Order_Date: '2024-10-01',
        Street_Address: '123 Main St',
        Product_IDs: '1:Option1,2:Option2',
        products: [
          {
            Product_ID: 1,
            Product_Name: 'Product 1',
            Product_Price: 50,
            Product_Image_URL: 'https://example.com/image1.jpg',
          },
          {
            Product_ID: 2,
            Product_Name: 'Product 2',
            Product_Price: 50,
            Product_Image_URL: 'https://example.com/image2.jpg',
          },
        ],
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockOrders),
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockOrders[0]), // Simulating the order details fetch
    });

    // Render the OrderManagement component
    render(<OrderManagement setActiveForm={jest.fn()} />);

    // Wait for the orders to load
    await waitFor(() => expect(screen.getByText('Order Management')).toBeInTheDocument());

    // Click the "View Details" button for the first order
    await fireEvent.click(screen.getByText('View Details'));

    // Ensure the order details are displayed
    expect(screen.getByText('Order Details for Order #1')).toBeInTheDocument();

    // Select a carrier
    fireEvent.change(screen.getByLabelText(/Select Carrier/i), { target: { value: 'Australia Post' } });

    // Click the "Mark as Completed" button
    fireEvent.click(screen.getByRole('button', { name: /Mark as Completed/i }));

    // Mocking the completion response
    fetch.mockResolvedValueOnce({ ok: true });

    // Wait for a confirmation dialog (mocked)
    window.confirm = jest.fn(() => true); // Simulate user confirming the action

    // Ensure that the fetch call to update the order status was made
    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/orders/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' }),
    });

    // Ensure that the order status was updated in the UI
    await waitFor(() => expect(screen.getByText('Completed')).toBeInTheDocument());
  });
});