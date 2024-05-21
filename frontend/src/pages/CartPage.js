import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CartPage.css';

import large_planter_tray from '../assets/large_planter_tray.jpg';
import desktop_planter_box from '../assets/desktop_planter_box.jpg';
import accessibility_planter_box from '../assets/accessibility_planter_box.jpg';
import small_standard_planter_box from '../assets/small_standard_planter_box.jpg';
import mini_standard_planter_box from '../assets/mini_standard_planter_box.jpg';
import mini_wicking_planter_box from '../assets/mini_wicking_planter_box.jpg';
import insta_garden_range from '../assets/insta_garden_range.jpg';
import large_standard_planter_box from '../assets/large_standard_planter_box.jpg';
import large_wicking_planter_box from '../assets/large_wicking_planter_box.jpg';
import medium_standard_planter_box from '../assets/medium_standard_planter_box.jpg';
import medium_wicking_planter_box from '../assets/medium_wicking_planter_box.jpg';
import side_table from '../assets/side_table.jpg';
import small_planter_tray from '../assets/small_planter_tray.jpg';
import small_wicking_planter_box from '../assets/small_wicking_planter_box.jpg';
import trellis from '../assets/trellis.jpg';

const imageMap = {
  'Mini Standard Planter Box': mini_standard_planter_box,
  'Small Standard Planter Box': small_standard_planter_box,
  'Medium Standard Planter Box': medium_standard_planter_box,
  'Large Standard Planter Box': large_standard_planter_box,
  'Mini Wicking Planter Box': mini_wicking_planter_box,
  'Small Wicking Planter Box': small_wicking_planter_box,
  'Medium Wicking Planter Box': medium_wicking_planter_box,
  'Large Wicking Planter Box': large_wicking_planter_box,
  'Small Planter Tray': small_planter_tray,
  'Large Planter Tray': large_planter_tray,
  'Desktop Planter Box': desktop_planter_box,
  'Accessibility Planter Box': accessibility_planter_box,
  'Insta Garden Range': insta_garden_range,
  'Side Table': side_table,
  'Trellis': trellis,
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.Product_Price * item.quantity, 0).toFixed(2);
  };

  const handleContinueShopping = () => {
    navigate('/browse'); // Adjust the path as needed
  };

  return (
    <>
      <Header />
      <div className="cart-page-container">
        <h1>Shopping Cart</h1>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <table className="cart-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td className="cart-item">
                    <Link to={`/product/${item.Product_ID}`}>
                      <img src={imageMap[item.Product_Name]} alt={item.Product_Name} className="cart-item-image" />
                    </Link>
                    <div>
                      <Link to={`/product/${item.Product_ID}`} className="cart-item-link">
                        <span>{item.Product_Name}</span>
                      </Link>
                      {item.selectedOption && <p className="cart-item-option">{item.selectedOption}</p>}
                    </div>
                  </td>
                  <td>${item.Product_Price.toFixed(2)}</td>
                  <td>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.Product_ID, item.selectedOption, parseInt(e.target.value))} 
                      className="quantity-input"
                    />
                  </td>
                  <td>${(item.Product_Price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeFromCart(item.Product_ID, item.selectedOption)} className="remove-button">✖</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="cart-summary">
          <p>Subtotal: ${calculateTotal()}</p>
          <button className="clear-cart-button" onClick={clearCart}>Clear Cart</button>
        </div>
        <div className="cart-actions">
          <button className="continue-shopping-button" onClick={handleContinueShopping}>Continue Shopping</button>
          <button className="checkout-button">Checkout</button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
