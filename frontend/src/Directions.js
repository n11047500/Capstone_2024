import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Browse from "./pages/Browse";
import AboutUs from "./pages/AboutUs";
import Gallery from "./pages/Gallery";
import ContactUs from "./pages/ContactUs";

import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import { CartProvider } from './context/CartContext';

const Directions = () => {
    return(
      <CartProvider>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<Browse />}/>
            <Route path="/aboutus" element={<AboutUs />}/>
            <Route path="/gallery" element={<Gallery />}/>
            <Route path="/contactus" element={<ContactUs/>}/>
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
        </Routes>
      </CartProvider>
    )
}

export { Directions };
