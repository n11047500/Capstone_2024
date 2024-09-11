import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { useSearchParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './OrderConfirmation.css';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const groupProducts = (productIds, productDetails) => {
  const grouped = {};

  // Convert productDetails to a map for quick lookup
  const productDetailMap = new Map(
    productDetails.map(p => [String(p.Product_ID), p])
  );

  console.log('Product IDs:', productIds);
  console.log('Product Details:', productDetails);

  // Parse the product IDs and options
  const productPairs = productIds.split(',').map(pair => {
    const [productId, option] = pair.split(':').map(item => item.trim());
    return { productId, option };
  });

  productPairs.forEach(product => {
    const key = `${product.productId}-${product.option || 'Default'}`;
    const productDetail = productDetailMap.get(String(product.productId));

    if (!productDetail) {
      console.error(`Product details not found for Product_ID: ${product.productId}`);
      console.error('Available product details:', productDetails);
      return;
    }

    if (!grouped[key]) {
      grouped[key] = {
        productId: product.productId,
        option: product.option,
        quantity: 1,
        Product_Price: productDetail.Product_Price,
        Product_Name: productDetail.Product_Name,
        Product_Image_URL: productDetail.Product_Image_URL,
        totalPrice: productDetail.Product_Price
      };
    } else {
      grouped[key].quantity += 1;
      grouped[key].totalPrice = grouped[key].Product_Price * grouped[key].quantity;
    }
  });

  console.log('Grouped products:', grouped);
  return Object.values(grouped);
};




const OrderConfirmationPage = () => {
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]); // Purchased products
  const [groupedProducts, setGroupedProducts] = useState([]); // Grouped products
  const [orderDetails, setOrderDetails] = useState({}); // Order details
  const { clearCart } = useContext(CartContext); // Access the clearCart method from CartContext
  const navigate = useNavigate();

  
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const clientSecret = searchParams.get('client_secret');
      if (!clientSecret) {
        setStatus('error');
        return;
      }

      try {
        const stripe = await stripePromise;
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          setStatus('success');

          // Fetch order details from backend
          const orderResponse = await fetch(`/api/orders/details?client_secret=${clientSecret}`);
          const orderData = await orderResponse.json();

          if (orderResponse.ok) {
            setProducts(orderData.products); // Store purchased products
            setOrderDetails(orderData.order); // Store order details
            
            const productIds = orderData.order.Product_IDs;
            const productDetails = orderData.products; // Assuming productDetails are fetched here
            const groupedProducts = groupProducts(productIds, productDetails);
            setGroupedProducts(groupedProducts);

            // Debugging outputs
            console.log("Fetched products:", orderData.products);
            console.log("Fetched grouped products:", groupedProducts);
          } else {
            console.error('Error fetching order details:', orderData.error);
          }
        } else if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
          setStatus('failed');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error retrieving payment status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

   const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  console.log('Order Date:', orderDetails.Order_Date);
  console.log('Selected Order:', orderDetails); // Log the entire order object
  
  
  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  });

  const handleContinueShopping = () => {
    clearCart(); // Clear the cart before navigating
    navigate('/browse');
};


  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  });

  return (
    <>
      <Header />
      <div className="confirmation-container">
        {status === 'loading' && <p>Loading payment status...</p>}
        {status === 'success' && (
          <div className="order-details">
            <h3>Thank you for your order!</h3>
            <p>Your payment was successful. A confirmation email has been sent to you.</p>

            {/* Display order information */}
            <h4>Order Information</h4>
            <p><strong>Order Number:</strong> {orderDetails.Order_ID}</p>
            <p><strong> Order Date: </strong>{orderDetails.created_at ? formatDate(orderDetails.created_at) : 'N/A'}</p>
            <p><strong>Order Type:</strong> {orderDetails.Order_Type}</p>
            <p><strong>Email:</strong> {orderDetails.Email}</p>
            <p><strong>Phone Number:</strong> {orderDetails.Mobile}</p>
            {orderDetails.Order_Type === 'Delivery' && (
              <p><strong>Delivery Address:</strong> {orderDetails.Street_Address}</p>
            )}
            <p><strong>Total Amount:</strong> ${orderDetails.Total_Amount}</p>

            {/* Display purchased items */}
            <h4>Items Purchased:</h4>
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Option</th>
                  <th>Quantity</th>
                  <th>Price (AUD)</th>
                </tr>
              </thead>
              <tbody>
              {groupedProducts.map((product) => (
                  <tr key={`${product.productId}-${product.option}`}>
                    <td><img src={product.Product_Image_URL} alt={product.Product_Name} /></td>
                    <td>{product.Product_Name}</td>
                    <td>{product.option || 'Default'}</td>
                    <td>{product.quantity}</td>
                    <td>{currencyFormatter.format(product.Product_Price * product.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {status === 'failed' && (
          <div>
            <h2>Payment Failed</h2>
            <p>Unfortunately, your payment could not be processed. Please try again or contact support.</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2>Something went wrong</h2>
            <p>We couldn't retrieve your payment status. Please contact support.</p>
          </div>
        )}
      </div>

      <div className="return-shopping-container"> 
        <button className="return-shopping-button" onClick={handleContinueShopping}>Continue Shopping</button>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;


