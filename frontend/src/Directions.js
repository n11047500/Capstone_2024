import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Browse from "./pages/Browse";
import ProductPage from "./pages/ProductPage";

export const Directions = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/product/:productId" element={<ProductPage />} />
            </Routes>
        </>
    );
};

export default Directions;
