import React, { useEffect, useState } from 'react';
import emailjs from 'emailjs-com';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CustomisedOrder.css';


const CustomisedOrder = () => {
    const [productColour, setProductColour] = useState([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        colorType: 'standard',
        color: '',
        customColor: '',
        width: '',
        wicking: '',
        firstName: '',
        lastName: '',
        email: '',
        comment: '',
        file: null,
    });

    useEffect(() => {
        const fetchProductColour = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/customise`);
                const data = await response.json();
                console.log(data); // Should log the array of colors
                setProductColour(Array.isArray(data) ? data : []); // Ensure it's an array
            } catch (error) {
                console.error('Error fetching product colour:', error);
            }
        };
    
        fetchProductColour();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
    
        // Specific logic for color selection
        if (name === "color") {
            if (value === "custom") {
                setFormData((prevData) => ({
                    ...prevData,
                    color: value,
                    customColor: '', // Reset the custom color if 'custom' is selected
                }));
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    color: value,
                    customColor: value, // Set the selected color as custom color
                }));
            }
        } else if (name === "colorType") {
            if (value === "standard") {
                setFormData((prevData) => ({
                    ...prevData,
                    colorType: value,
                    color: '', // Reset the selected color if switching to standard colors
                }));
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    colorType: value,
                }));
            }
        } else {
            // Update other form fields
            setFormData((prevData) => ({
                ...prevData,
                [name]: files ? files[0] : value,
            }));
        }
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Create a new object to hold form data
        const formDataObj = { ...formData };

        // Ensure colorType is set
        if (!formDataObj.colorType) {
            formDataObj.colorType = 'None'; // or set a default value
        }
    
        // Check which field is filled and set the other to 'None'
        if (formDataObj.color && !formDataObj.customColor) {
            formDataObj.customColor = 'None';
        } else if (!formDataObj.color && formDataObj.customColor) {
            formDataObj.color = 'None';
        } else if (formDataObj.color && formDataObj.customColor) {
            if (formDataObj.color === formDataObj.customColor) {
                formDataObj.customColor = 'None';
            }
        }
    
        // Add colorType to formDataObj
        formDataObj.colorType = formData.colorType;

        let fileContent = 'None'; // Default value
    
        if (formData.file) {
            const file = formData.file;
    
            // Convert the file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                fileContent = reader.result; // Base64 string with data URI scheme
    
                // After getting the base64 string, send the email
                sendEmailWithAttachments(formDataObj, fileContent);

            };
        } else {
            // No file, send the email with 'None'
            sendEmailWithAttachments(formDataObj, fileContent);

        }
    };
    
    const sendEmailWithAttachments = async (formDataObj, fileContent) => {
        const templateParams = {
            firstName: formDataObj.firstName,
            lastName: formDataObj.lastName,
            order_id: formDataObj.order_id,
            colorType: formDataObj.colorType,
            color: formDataObj.color,
            customColor: formDataObj.customColor,
            width: formDataObj.width,
            wicking: formDataObj.wicking,
            email: formDataObj.email,
            comment: formDataObj.comment,
            file: fileContent // Pass the base64 string or 'None'
        };
    
        try {
            const emailResponse = await emailjs.send(
                'service_dz5mq6k',
                'template_0v39twh',
                templateParams,
                '6O_l-WGEmkFadQ-Xv'
            );
    
            if (emailResponse.status === 200) {
                alert('Email sent successfully!');
                // Reset form fields if necessary

                navigate('/confirmation');

            } else {
                alert('Failed to send email.');
            }
        } catch (error) {
            console.error('Failed to send email:', error.text || error);
            alert('Failed to send email.');
        }
    };
    
    
    
    
    
    
    
    




    return (
      <div className="Customised_Order">
        <Header />
        <div className="customised-section">
            <div className="customised-description">
                <h1>Ezee Order Customised Planter Box</h1>
                <h2>
                    Ezee Planter Boxes allows you to order your ideal planter box. You can select your ideal 
                    colour, width and whether you want wicking implemented into your planter box. 
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="customised-order-form">
            <div className="form-section product-info">
                <h2>Product Information</h2>
                <div className="form-group">
                    <label>Select Colour:</label>
                    <div className="radio-group-container">
                        <div className="radio-group">
                            <label htmlFor="standard" className="label-small">Standard.. </label>
                            <input
                                type="radio"
                                id="standard"
                                name="colorType"
                                value="standard"
                                checked={formData.colorType === 'standard'}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="radio-group">
                            <label htmlFor="custom" className="label-small">Custom.. </label>
                            <input
                                type="radio"
                                id="custom"
                                name="colorType"
                                value="custom"
                                checked={formData.colorType === 'custom'}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <br />

                <div className="form-group">
                    {formData.colorType === 'standard' && (
                        <select
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a color</option>
                            <optgroup label="Ezee Standard Colors">
                                {productColour.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </optgroup>
                        </select>
                    )}
                    {formData.colorType === 'custom' && (
                        <input
                            type="text"
                            name="customColor"
                            value={formData.customColor}
                            placeholder="Enter Custom Color"
                            onChange={handleChange}
                            required
                        />
                    )}
                </div>

                <div className="form-group">
                    <label>Width (cm):</label>
                    <input
                        type="number"
                        name="width"
                        value={formData.width}
                        onChange={handleChange}
                        placeholder="Enter width in cm"
                        min="0"
                    />
                </div>
                <br />

                <div className="form-group">
                    <label>Wicking:</label>
                    <div className="radio-group-container">
                        <div className="radio-group">
                            <label className="label-small">Yes.. </label>
                            <input
                                type="radio"
                                name="wicking"
                                value="yes"
                                checked={formData.wicking === 'yes'}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="radio-group">
                            <label className="label-small">No.. </label>
                            <input
                                type="radio"
                                name="wicking"
                                value="no"
                                checked={formData.wicking === 'no'}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-section personal-info">
                <h2>Personal Information</h2>
                <div className="form-group">
                    <label>First Name:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Last Name:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        placeholder="(optional)"
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-section comments">
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                    <label>Comments:</label>
                    <label htmlFor="file-upload" className="file-upload-label" aria-label="Attach a file">
                        <i className="fa fa-paperclip"></i> Add attachment (optional)
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        className="file-upload-input"
                        name="file"
                        onChange={handleChange}
                        aria-label="Upload a file"
                    />
                    <textarea
                        className="comment-text"
                        name="comment"
                        id="textSize"
                        cols="70"
                        rows="8"
                        value={formData.comment}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <button type="submit" className="submit-button">Submit Form</button>
        </form>
        </div><br />
        <Footer />
      </div>
    );
    
  }
  
  export default CustomisedOrder;