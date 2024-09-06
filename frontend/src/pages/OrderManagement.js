import React, { useState, useEffect } from 'react';
import './OrderManagement.css';

const OrderManagement = ({ setActiveForm }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleOrderStatusChange = (orderId, newStatus) => {
    const confirmation = window.confirm('Are you sure you want to mark this order as completed?');
    if (!confirmation) return;
  
    if (selectedOrder.Order_Type === 'Delivery') {
      const trackingNumber = window.prompt('Enter the tracking number for this delivery:');
      if (!trackingNumber) return;
  
      const productDetailsTable = selectedOrder.products
        .map(
          (product) =>
            `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <img src="${product.Product_Image_URL}" alt="${product.Product_Name}" style="width: 50px; height: 50px;" />
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">${product.Product_Name}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${product.option}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">1</td>
              <td style="padding: 8px; border: 1px solid #ddd;">$${product.Product_Price.toFixed(2)}</td>
            </tr>`
        )
        .join('');
  
      const message = `
  <html>
  <body>
    <p>Dear ${selectedOrder.First_Name},</p>
    <p>We are excited to let you know that your order has been shipped!</p>
    
    <h4>Order Details:</h4>
    <p><strong>Order ID:</strong> ${selectedOrder.Order_ID}</p>
    <p><strong>Order Date:</strong> ${formatDate(selectedOrder.Order_Date)}</p>
    <p><strong>Total Amount:</strong> $${selectedOrder.Total_Amount.toFixed(2)}</p>
  
    <h4>Products Ordered:</h4>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <thead>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd;">Image</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Product Name</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Option</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${productDetailsTable}
      </tbody>
    </table>
  
    <p>Your tracking details are as follows:</p>
    <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
  
    <p>You can track your order using the tracking number provided through the carrier's website.</p>
    <p>If you have any questions or need further assistance, please don't hesitate to contact our customer support team.</p>
  
    <p>Thank you for choosing EZee Planter Boxes!</p>
  
    <p>Best regards,</p>
    <p><strong>EZee Planter Boxes</strong><br>Customer Support Team</p>
  </body>
  </html>
  `;
  
      sendEmail(selectedOrder.Email, 'Your Order is on the Way!', message);
    } else if (selectedOrder.Order_Type === 'Click and Collect') {
      const productDetailsTable = selectedOrder.products
        .map(
          (product) =>
            `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <img src="${product.Product_Image_URL}" alt="${product.Product_Name}" style="width: 50px; height: 50px;" />
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">${product.Product_Name}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${product.option}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">1</td>
              <td style="padding: 8px; border: 1px solid #ddd;">$${product.Product_Price.toFixed(2)}</td>
            </tr>`
        )
        .join('');
  
      const message = `
  <html>
  <body>
    <p>Dear ${selectedOrder.First_Name},</p>
    <p>We are pleased to inform you that your order is now ready for collection!</p>
    
    <h4>Order Details:</h4>
    <p><strong>Order ID:</strong> ${selectedOrder.Order_ID}</p>
    <p><strong>Order Date:</strong> ${formatDate(selectedOrder.Order_Date)}</p>
    <p><strong>Total Amount:</strong> $${selectedOrder.Total_Amount.toFixed(2)}</p>
  
    <h4>Products Ordered:</h4>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <thead>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd;">Image</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Product Name</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Option</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${productDetailsTable}
      </tbody>
    </table>
  
    <p>Please visit our store at your earliest convenience to pick up your order.</p>
  
    <p><strong>Store Address:</strong></p>
    <p>21 Huntington Street,</p>
    <p>Clontarf QLD 4019</p>
    <p><strong>Phone:</strong> 07 3248 8180</p>
  
    <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
  
    <p>Thank you for choosing EZee Planter Boxes!</p>
  
    <p>Best regards,</p>
    <p><strong>EZee Planter Boxes</strong><br>Customer Support Team</p>
  </body>
  </html>
  `;
  
      sendEmail(selectedOrder.Email, 'Your Order is Ready for Collection!', message);
    }
  
    // Update order status
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

  const sendEmail = (to, subject, message) => {
    fetch(`${process.env.REACT_APP_API_URL}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html: message }),
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

  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className="order-management">
      <h3>Order Management</h3>
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
                        className="order-item-button"
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
                {selectedOrder.products ? (
                  selectedOrder.products.map(product => (
                    <tr key={product.Product_ID}>
                      <td><img src={product.Product_Image_URL} alt={product.Product_Name} style={{ width: '50px', height: '50px' }} /></td>
                      <td>{product.Product_Name}</td>
                      <td>{product.option}</td>
                      <td>1</td>
                      <td>${product.Product_Price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No products available for this order.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <br />
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