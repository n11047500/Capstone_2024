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
                <p>To check your submitted form, here are the details below:</p>
                    <div>
                    <table className="tCenter">
                    <tr>
                        <th colspan="2">Product Information</th>
                    </tr>
                    <tr>
                        <td>Color Type:</td>
                        <td>{formData.colorType || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <td>Selected Color:</td>
                        <td>{formData.color || 'None'}</td>
                    </tr>
                    <tr>
                        <td>Custom Color:</td>
                        <td>{formData.customColor || 'None'}</td>
                    </tr>
                    <tr>
                        <td>Width (cm):</td>
                        <td>{formData.width || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <td>Wicking:</td>
                        <td>{formData.wicking || 'Not specified'}</td>
                    </tr>
                    </table>

                    <br /><br />

                    <table className="tCenter">
                        <tr>
                            <th colspan="2">Personal Information</th>
                        </tr>
                        <tr>
                            <td>First Name:</td>
                            <td>{formData.firstName || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <td>Last Name:</td>
                            <td>{formData.lastName || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <td>Email:</td>
                            <td>{formData.email || 'Not specified'}</td>
                        </tr>
                    </table>

                    <br /><br />

                    <table className="tCenter">
                        <tr>
                            <th colspan="2">Additional Information</th>
                        </tr>

                        {formData.file ? (
                            <tr>
                                <td>File Attachment</td>
                                <td><img src={formData.file} alt="Attached Image" style={{ maxWidth: '100px', maxHeight: '100px' }} /></td>
                            </tr>
                        ) : (
                            <tr>
                                <td>File Attachment</td>
                                <td>None</td>
                            </tr>
                        )}

                        <tr>
                            <td style="width:70%" colspan="2"><strong>Comments: </strong>{formData.comment || 'None'}</td>
                        </tr>
                    </table>
                    </div>
                </div>

            </div>
            
            <Footer />
        </div>
    );
};

export default ConfirmationPage;
