import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Browse from "./pages/Browse";
import AboutUs from "./pages/AboutUs";
import Gallery from "./pages/Gallery";
import ContactUs from "./pages/ContactUs";
import ProductPage from './pages/ProductPage';
import ReviewPage from "./pages/ReviewPage";
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPassword from "./pages/ForgotPassword";
import UserProfile from './pages/UserProfile';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderConfirmation from './pages/Checkout/OrderConfirmation';
import { CartProvider } from './context/CartContext';
import CustomisedOrder from "./pages/CustomOrder/CustomisedOrder";
import ConfirmationPage from './pages/CustomOrder/orderCustom';
import ResetPassword from "./pages/ResetPassword";

// Component responsible for routing across the entire application
const Directions = () => {
    return (
      // Wrap the entire application with the CartProvider to manage cart state globally
      <CartProvider>
        {/* Define the routes for the application */}
        <Routes>
            <Route path="/" element={<HomePage />} /> {/* Route for the homepage */}
            <Route path="/browse" element={<Browse />} /> {/* Route for browsing products */}
            <Route path="/aboutus" element={<AboutUs />} /> {/* Route for the About Us page */}
            <Route path="/gallery" element={<Gallery />} /> {/* Route for the gallery page */}
            <Route path="/contactus" element={<ContactUs />} /> {/* Route for the Contact Us page */}
            <Route path="/product/:productId" element={<ProductPage />} /> {/* Route for product details page */}
            <Route path="/reviews/:productId" element={<ReviewPage />} /> {/* Route for product review page */}
            <Route path="/cart" element={<CartPage />} /> {/* Route for the cart page */}
            <Route path="/login" element={<LoginPage />} /> {/* Route for the login page */}
            <Route path="/signup" element={<SignUpPage />} /> {/* Route for the signup page */}
            <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Route for the forgot password page */}
            <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* Route for password reset with token */}
            <Route path="/user/:email" element={<UserProfile />} /> {/* Route for user profile page */}
            <Route path="/customise" element={<CustomisedOrder />} /> {/* Route for creating customised orders */}
            <Route path="/confirmation" element={<ConfirmationPage />} /> {/* Route for order confirmation */}
            <Route path="/checkout" element={<CheckoutPage />} /> {/* Route for the checkout page */}
            <Route path="/order-confirmation" element={<OrderConfirmation />} /> {/* Route for order confirmation after checkout */}
        </Routes>
      </CartProvider>
    );
}

export { Directions };