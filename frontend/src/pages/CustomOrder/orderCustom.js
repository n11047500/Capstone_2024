import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './orderCustom.css';

const OrderCustomisaton = () => {
    const location = useLocation();
    const formData = location.state;

    return (
        <div className="confirmation-custom-form">
            <Header />

            <div className="confirmation-custom-container">
                <div className="confirmation-custom-description">
                <h1>Thank You for submitting your form!</h1>
                <p>Your customized order has been sent to Ezee Planter. We'll send you another email confirming your customised planter box and the details of delivery.</p>
                </div>

                <div className="confirmation-custom-form">
                <p></p>
                </div>

            </div>
            
            <Footer />
        </div>
    );
};

export default OrderCustomisaton;
