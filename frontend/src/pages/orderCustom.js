import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './orderCustom.css';

const ConfirmationPage = () => {
    const location = useLocation();
    const formData = location.state;

    return (
        <div className="confirmation-form">
            <Header />

            <div className="confirmation-container">
                <div className="confirmation-description">
                <h1>Thank You for submitting your form!</h1>
                <p>Your customized order has been sent to Ezee Planter. We'll send you another email confirming your customised planter box and the details of delivery.</p>
                </div>

                <div className="confirmation-form">
                <p></p>
                </div>

            </div>
            
            <Footer />
        </div>
    );
};

export default ConfirmationPage;
