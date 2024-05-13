import React from "react";
import { Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Browse from "./pages/Browse";
import NavBar from "./components/Header";
import Footer from "./components/Footer";

export const Directions = () => {
    return(
        <>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<Browse />}/>
        </Routes>
        </>
    )
}

export default Directions;