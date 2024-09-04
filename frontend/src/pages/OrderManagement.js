import React, { useState, useEffect } from 'react';
import './OrderManagement.css'; // Import the CSS file

const OrderManagement = ({ setActiveForm }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('pending');
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
        if (data.Product_IDs) {
          const productPairs = data.Product_IDs.split(',').map(pair => {
            const [productId, option] = pair.split(':').map(item => item.trim());
            return { productId, option };
          });

          const productIds = productPairs.map(pair => pair.productId);

          if (productIds.length > 0) {
            fetch(`${process.env.REACT_APP_API_URL}/products?ids=${productIds.join(',')}`)
              .then(response => response.json())
              .then(products => {
                const productsWithOptions = productPairs.map(pair => {
                  const product = products.find(p => p.Product_ID == pair.productId);
                  return product ? { ...product, option: pair.option } : null;
                }).filter(product => product !== null);

                setSelectedOrder({ ...data, products: productsWithOptions });
                setLoading(false);
              })
              .catch(error => {
                console.error('Error fetching product details:', error);
                setError('Failed to fetch product details. Please try again later.');
                setLoading(false);
              });
          } else {
            setSelectedOrder({ ...data, products: [] });
            setLoading(false);
          }
        } else {
          setSelectedOrder({ ...data, products: [] });
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching order details:', error);
        setError('Failed to fetch order details. Please try again later.');
        setLoading(false);
      });
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}`, { // Ensure the endpoint is correct
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(response => {
        if (response.ok) {
          setOrders(prevOrders => prevOrders.map(order =>
            order.Order_ID === orderId ? { ...order, status: newStatus } : order
          ));
          setSelectedOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
        } else {
          console.error('Error updating order status');
          setError('Failed to update order status. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error updating order status:', error);
        setError('Failed to update order status. Please try again later.');
      });
  };
  
  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="order-management">
      <h3>Order Management</h3>
      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading...</p>}

      {!selectedOrder ? (
        <>
          <select onChange={(e) => setOrderStatusFilter(e.target.value)} className="select-filter">
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
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
            <p>Email: {selectedOrder.Email}</p>
            <p>Address: {selectedOrder.Street_Address}</p>
            <p>Total Amount: ${selectedOrder.Total_Amount}</p>

            {selectedOrder.status === 'pending' && (
              <button
                onClick={() => handleOrderStatusChange(selectedOrder.Order_ID, 'completed')}
                className="order-item-button"
              >
                Mark as Completed
              </button>
            )}

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
                      <td>{product.Quantity}</td>
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
          </div>
        </>
      )}
    </div>
  );
};

export default OrderManagement;
