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

  it('should group products by ID and option', () => {
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

  it('should handle multiple quantities of the same product', () => {
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

  it('should return an empty array if no product details are provided', () => {
    const productIds = '101:Default';
    
    const result = groupProducts(productIds, []);
    
    expect(result).toEqual([]);
  });

  it('should handle invalid product IDs gracefully', () => {
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

  it('renders order list with mock data', async () => {
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

  it('displays order details when View Details is clicked', async () => {
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

  it('handles error when fetching orders fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch orders'));

    render(<OrderManagement setActiveForm={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch orders/i)).toBeInTheDocument();
    });
  });

  test('marks an order as completed', async () => {
    // Mock response for orders
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          Order_ID: '1',
          First_Name: 'John',
          Last_Name: 'Doe',
          Email: 'john.doe@example.com',
          status: 'Pending',
          Order_Type: 'Delivery',
          Product_IDs: '1:Option1',
          products: [
            {
              Product_ID: '1',
              Product_Name: 'Sample Product',
              Product_Price: '20.00',
              Product_Image_URL: 'http://example.com/image.jpg'
            }
          ]
        }
      ]
    });

    // Mock response for order details
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        Order_ID: '1',
        First_Name: 'John',
        Last_Name: 'Doe',
        Email: 'john.doe@example.com',
        Mobile: '1234567890',
        Order_Date: new Date(),
        Street_Address: '123 Street',
        Total_Amount: '20.00',
        Order_Type: 'Delivery',
        products: [
          {
            Product_ID: '1',
            Product_Name: 'Sample Product',
            Product_Price: '20.00',
            Product_Image_URL: 'http://example.com/image.jpg'
          }
        ]
      })
    });

    // Mock successful order update response
    fetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<OrderManagement />);

    // Wait for the orders to load
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    // Click on the order to view details
    fireEvent.click(screen.getByText('View Details'));

    // Select a carrier and mark as completed
    fireEvent.change(screen.getByLabelText('Select Carrier:'), { target: { value: 'Australia Post' } });

    // Mock window.confirm to always return true
    window.confirm = jest.fn(() => true);
    // Mock window.prompt to return a dummy tracking number
    window.prompt = jest.fn(() => '123456');

    // Click the "Mark as Completed" button
    fireEvent.click(screen.getByText('Mark as Completed'));

    // Wait for the order to be marked as completed
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3); // Ensure all fetch calls were made
      expect(fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/orders/1'), // URL check
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'Completed' }), // Ensure status update is sent
        })
      );
    });
  });
});