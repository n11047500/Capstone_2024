import React from "react";
import { Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Browse from "./pages/Browse";
import AboutUs from "./pages/AboutUs";
import Gallery from "./pages/Gallery";

export const Directions = () => {
    return(
        <>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<Browse />}/>
            <Route path="/aboutus" element={<AboutUs />}/>
            <Route path="/gallery" element={<Gallery />}/>
        </Routes>
        </>
    )
}

export default Directions;