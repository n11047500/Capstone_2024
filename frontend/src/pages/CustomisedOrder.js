import React, { useEffect, useState } from 'react';
import emailjs from 'emailjs-com';
import { useNavigate, useParams } from 'react-router-dom';
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
      
        try {
          // Create a new FormData object
          const formDataObj = new FormData();
      
          // Append each field to the FormData object
          formDataObj.append('colorType', formData.colorType);
          formDataObj.append('color', formData.color);
          formDataObj.append('customColor', formData.customColor);
          formDataObj.append('width', formData.width);
          formDataObj.append('wicking', formData.wicking);
          formDataObj.append('firstName', formData.firstName);
          formDataObj.append('lastName', formData.lastName);
          formDataObj.append('email', formData.email);
          formDataObj.append('comment', formData.comment);
      
          // If a file is selected, append it to the FormData object
          if (formData.file) {
            formDataObj.append('file', formData.file);
          }
      
          // Check which color fields are filled and set the other to 'None'
          if (formData.color && !formData.customColor) {
            formDataObj.set('customColor', 'None');
          } else if (!formData.color && formData.customColor) {
            formDataObj.set('color', 'None');
          } else if (formData.color === formData.customColor) {
            formDataObj.set('customColor', 'None');
          }
      
          // Send form data to the backend, making sure to not set Content-Type explicitly (FormData will set it)
          const response = await fetch('http://localhost:3001/submit-form', {
            method: 'POST',
            body: formDataObj, // Send FormData directly
          });
      
          if (response.ok) {
            console.log('Form submitted successfully');
            alert('Email sent successfully!');
            // Redirect after successful submission
            navigate('/confirmation');
          } else {
            alert('Failed to send form.');
            console.error('Error submitting form');
          }
        } catch (error) {
          console.error('Error:', error);
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