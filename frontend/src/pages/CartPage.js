import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CartPage.css';

const CartPage = () => {
  // Retrieve cart functions and data from CartContext
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Currency formatter for displaying prices
  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  });

  // Calculate the total price of all items in the cart
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.Product_Price * item.quantity, 0);
  };

  // Navigate to the checkout page
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Navigate back to the browse page
  const handleContinueShopping = () => {
    navigate('/browse');
  };

  return (
    <>
      <Header />
      <div className="cart-page-container">
        <h1>Shopping Cart</h1>
        {cart.length === 0 ? (
          // Display message if the cart is empty
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
                      <img src={item.Product_Image_URL} alt={item.Product_Name} className="cart-item-image" />
                    </Link>
                    <div>
                      <Link to={`/product/${item.Product_ID}`} className="cart-item-link">
                        <span>{item.Product_Name}</span>
                      </Link>
                      {/* Display selected option if available */}
                      {item.selectedOption && <p className="cart-item-option">{item.selectedOption}</p>}
                    </div>
                  </td>
                  <td>{currencyFormatter.format(item.Product_Price)}</td>
                  <td>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        // Ensure quantity is at least 1
                        if (value >= 1) {
                          updateQuantity(item.Product_ID, item.selectedOption, value);
                        }
                      }}                       className="quantity-input"
                      aria-label="Quantity"
                    />
                  </td>
                  <td>{currencyFormatter.format(item.Product_Price * item.quantity)}</td>
                  <td>
                    <button 
                      onClick={() => removeFromCart(item.Product_ID, item.selectedOption)} 
                      className="remove-button"
                      aria-label="Remove"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="cart-summary">
          <p>Subtotal: {currencyFormatter.format(calculateTotal())}</p>
          <button className="clear-cart-button" onClick={clearCart}>Clear Cart</button>
        </div>
        <div className="cart-actions">
          <button className="continue-shopping-button" onClick={handleContinueShopping}>Continue Shopping</button>
          <button 
            className="checkout-button" 
            onClick={handleCheckout}
            disabled={cart.length === 0} // Disable button if cart is empty
          >
            Checkout
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
