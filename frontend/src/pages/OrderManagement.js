import React, { useState, useEffect } from 'react';
import './OrderManagement.css';

// Helper function to group products by ID and options
export const groupProducts = (productIds, productDetails = []) => {
  if (!productDetails || productDetails.length === 0) {
    console.error('No product details provided.');
    return [];
  }

  const grouped = {};
  // Map for quick lookup of product details by Product_ID
  const productDetailMap = new Map(
    productDetails.map(p => [String(p.Product_ID), p])
  );

  // Parsing product IDs and options from a string
  const productPairs = (productIds || '').split(',').map(pair => {
    const [productId, option] = pair.split(':').map(item => item.trim());
    return { productId, option };
  });

  // Grouping products by ID and options
  productPairs.forEach(product => {
    const key = `${product.productId}-${product.option || 'Default'}`;
    const productDetail = productDetailMap.get(String(product.productId));

    if (!productDetail) {
      console.error(`Product details not found for Product_ID: ${product.productId}`);
      return;
    }

    // Initialize or update the grouped product data
    if (!grouped[key]) {
      grouped[key] = {
        productId: product.productId,
        option: product.option,
        quantity: 1,
        Product_Price: productDetail.Product_Price,
        Product_Name: productDetail.Product_Name,
        Product_Image_URL: productDetail.Product_Image_URL,
        totalPrice: parseFloat(productDetail.Product_Price)
      };
    } else {
      grouped[key].quantity += 1;
      grouped[key].totalPrice = grouped[key].Product_Price * grouped[key].quantity;
    }
  });

  return Object.values(grouped);
};

// Main component for managing orders
const OrderManagement = ({ setActiveForm }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCarrier, setSelectedCarrier] = useState('');

  // Formatter for displaying currency values in AUD
  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  });

  // Effect to fetch orders based on the selected filter
  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/orders?status=${orderStatusFilter}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error('Unexpected data format while fetching orders:', data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
      });
  }, [orderStatusFilter]);

  // Fetch details for a specific order when clicked
  const handleOrderClick = (orderId) => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}`)
      .then(response => response.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setSelectedOrder(data);
        } else {
          console.error('No products found for this order:', data);
          setSelectedOrder({ ...data, products: [] });
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching order details:', error);
        setError('Failed to fetch order details. Please try again later.');
        setLoading(false);
      });
  };

  // Handle the order status update (e.g., marking as completed)
  const handleOrderStatusChange = (orderId, newStatus) => {
    const confirmation = window.confirm('Are you sure you want to mark this order as completed?');
    if (!confirmation) return;

    if (selectedOrder.Order_Type === 'Delivery') {
      if (!selectedCarrier) {
        alert('Please select a carrier before proceeding.');
        return;
      }

      const carrierTrackingURLs = {
        "Australia Post": "https://auspost.com.au/mypost/track/#/details/",
        "StarTrack": "https://startrack.com.au/track/",
        "Toll": "https://www.tollgroup.com/tools/mytoll",
        "CouriersPlease": "https://www.couriersplease.com.au/Tools/Track",
        "DHL": "https://www.dhl.com/en/express/tracking.html?AWB=",
        "Aramex": "https://www.aramex.com.au/tools/track/",
        "Sendle": "https://track.sendle.com/tracking?ref="
      };

      const trackingNumber = window.prompt('Enter the tracking number for this delivery (leave blank if no tracking number is available):');

      const trackingLink = trackingNumber ? `<a href="${carrierTrackingURLs[selectedCarrier]}${trackingNumber}" target="_blank">Track your order here</a>` : '';

      // Generate email content for delivery
      const productDetailsTable = selectedOrder.products
        .map(
          (product) =>
            `<tr>
              <td><img src="${product.Product_Image_URL}" alt="${product.Product_Name}" style="width: 50px; height: 50px;" /></td>
              <td>${product.Product_Name}</td>
              <td>${product.option}</td>
              <td>1</td>
              <td>${currencyFormatter.format(product.Product_Price)}</td>
            </tr>`
        )
        .join('');

      const message = trackingNumber ? `...` : `...`;

      sendEmail(selectedOrder.Email, 'Your Order is on the Way!', message);
    } else if (selectedOrder.Order_Type === 'Click and Collect') {
      // Generate email content for click and collect
      const productDetailsTable = selectedOrder.products
        .map(
          (product) =>
            `<tr>
              <td><img src="${product.Product_Image_URL}" alt="${product.Product_Name}" style="width: 50px; height: 50px;" /></td>
              <td>${product.Product_Name}</td>
              <td>${product.option}</td>
              <td>1</td>
              <td>${currencyFormatter.format(product.Product_Price)}</td>
            </tr>`
        )
        .join('');

      const message = `...`;

      sendEmail(selectedOrder.Email, 'Your Order is Ready for Collection!', message);
    }

    // Update the order status in the backend
    fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (response.ok) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.Order_ID === orderId ? { ...order, status: newStatus } : order
            )
          );
          setSelectedOrder((prevOrder) => ({ ...prevOrder, status: newStatus }));
        } else {
          console.error('Error updating order status');
          setError('Failed to update order status. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error updating order status:', error);
        setError('Failed to update order status. Please try again later.');
      });
  };

  // Function to send an email notification
  const sendEmail = (to, subject, html) => {
    fetch(`${process.env.REACT_APP_API_URL}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    })
      .then(response => {
        if (response.ok) {
          alert('Email sent successfully!');
        } else {
          console.error('Error sending email');
          setError('Failed to send email. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error sending email:', error);
        setError('Failed to send email. Please try again later.');
      });
  };

  // Navigate back to the order list
  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  // Format the date for display
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className="order-management">
      <h2>Order Management</h2>
      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading...</p>}

      {!selectedOrder ? (
        <>
          <select onChange={(e) => setOrderStatusFilter(e.target.value)} className="select-filter">
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.Order_ID}>
                    <td>{order.Order_ID}</td>
                    <td>{order.First_Name} {order.Last_Name}</td>
                    <td>{order.Email}</td>
                    <td>{order.status}</td>
                    <td>
                    <button
                        onClick={() => handleOrderClick(order.Order_ID)}
                        className="view-details-button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No orders available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <button onClick={handleBackToOrders} className="back-button">Back to Orders</button>

          <div className="order-details">
            <h4>Order Details for Order #{selectedOrder.Order_ID}</h4>
            <p>Customer: {selectedOrder.First_Name} {selectedOrder.Last_Name}</p>
            <p>Order Type: {selectedOrder.Order_Type}</p>
            <p>Email: <a href={`mailto:${selectedOrder.Email}`}>{selectedOrder.Email}</a></p>
            <p>Phone: <a href={`tel:${selectedOrder.Mobile}`}>{selectedOrder.Mobile}</a></p>
            <p>Order Date: {formatDate(selectedOrder.Order_Date)}</p>
            <p>Address: {selectedOrder.Street_Address}</p>
            <p>Total Amount: ${selectedOrder.Total_Amount}</p>
          
            <h5>Products in Order:</h5>
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Option</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder && selectedOrder.products ? (
                  groupProducts(selectedOrder.Product_IDs, selectedOrder.products).map(product => (
                    <tr key={product.productId}>
                      <td><img src={product.Product_Image_URL} alt={product.Product_Name} style={{ width: '50px', height: '50px' }} /></td>
                      <td>{product.Product_Name}</td>
                      <td>{product.option}</td>
                      <td>{product.quantity}</td>
                      <td>${isNaN(product.totalPrice) ? 'N/A' : product.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No products available for this order.</td>
                  </tr>
                )}
             </tbody>
            </table>
            <br></br>
            <br></br>
            {selectedOrder.Order_Type === 'Delivery' && (
              <>
                <label htmlFor="carrier">Select Carrier:</label>
                <select
                  id="carrier"
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                >
                  <option value="">Choose a carrier</option>
                  <option value="Australia Post">Australia Post</option>
                  <option value="StarTrack">StarTrack</option>
                  <option value="Toll">Toll</option>
                  <option value="CouriersPlease">CouriersPlease</option>
                  <option value="DHL">DHL</option>
                  <option value="Aramex">Aramex</option>
                  <option value="Sendle">Sendle</option>
                </select>
              </>
            )}

            {selectedOrder.status === 'Pending' && (
              <button
                onClick={() => handleOrderStatusChange(selectedOrder.Order_ID, 'Completed')}
                className="order-item-button"
              >
                Mark as Completed
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderManagement;