import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './OrderConfirmation.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const groupProducts = (productIds, productDetails) => {
  const grouped = {};
  const productDetailMap = new Map(
    productDetails.map(p => [String(p.Product_ID), p])
  );

  console.log('Product IDs:', productIds);
  console.log('Product Details:', productDetails);

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

    const productPrice = parseFloat(productDetail.Product_Price); 

    if (isNaN(productPrice)) {
      console.error(`Invalid Product_Price for Product_ID: ${product.productId}`);
      return;
    }

    if (!grouped[key]) {
      grouped[key] = {
        productId: product.productId,
        option: product.option,
        quantity: 1,
        Product_Price: productPrice,
        Product_Name: productDetail.Product_Name,
        Product_Image_URL: productDetail.Product_Image_URL,
        totalPrice: productPrice
      };
    } else {
      grouped[key].quantity += 1;
      grouped[key].totalPrice = grouped[key].Product_Price * grouped[key].quantity;
    }
  });

  Object.values(grouped).forEach(product => {
    product.totalPrice = Number(product.totalPrice);
  });

  console.log('Grouped products:', grouped);
  return Object.values(grouped);
};



const OrderConfirmationPage = () => {
  const [status, setStatus] = useState('loading');
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]); // State to hold purchased products
  const [groupedProducts, setGroupedProducts] = useState([]); // State to hold grouped products
  const [orderDetails, setOrderDetails] = useState({}); // State to hold additional order details

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
            setProducts(orderData.products); // Store the purchased products
            setOrderDetails(orderData.order); // Store the order details
            
            const productIds = orderData.order.Product_IDs;
            const productDetails = orderData.products; // Assuming productDetails come from the same endpoint or adjust as needed
            const groupedProducts = groupProducts(productIds, productDetails);
            setGroupedProducts(groupedProducts);

            // Debugging to check fetched products
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
            <p><strong>Order Date:</strong> {orderDetails.created_at ? formatDate(orderDetails.created_at) : 'N/A'}</p>
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
  {groupedProducts.map((product) => {
    const totalPrice = Number(product.totalPrice); // Ensure totalPrice is a number
    console.log(`Product: ${product.Product_Name}, Total Price: ${totalPrice}`);
    return (
      <tr key={`${product.productId}-${product.option}`}>
        <td><img src={product.Product_Image_URL} alt={product.Product_Name} /></td>
        <td>{product.Product_Name}</td>
        <td>{product.option || 'Default'}</td>
        <td>{product.quantity}</td>
        <td>${totalPrice.toFixed(2)}</td> {/* Ensure totalPrice is a number */}
      </tr>
    );
  })}
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
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;
