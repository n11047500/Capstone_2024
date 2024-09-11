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
import CustomisedOrder from "./pages/CustomisedOrder";
import ConfirmationPage from './pages/orderCustom';
import ResetPassword from "./pages/ResetPassword";

const Directions = () => {
    return (
      <CartProvider>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/reviews/:productId" element={<ReviewPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/user/:email" element={<UserProfile />} />
            <Route path="/customise" element={<CustomisedOrder />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Routes>
      </CartProvider>
  )
}

export { Directions };
