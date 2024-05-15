import React from "react";
import { Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Browse from "./pages/Browse";

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