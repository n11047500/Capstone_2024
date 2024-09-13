import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './CustomisedOrder.css';
import PersonalInfo from './personalInfo';
import CustomOptions from './customOptions';
import AdditionalInformation from './additionalInformation';


const CustomisedOrder = () => {
    const [productColour, setProductColour] = useState([]);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customOptions: {},
        personalInfo: {},
        additionalInformation: {},
    });

    // const [formData, setFormData] = useState({
    //     colorType: 'standard',
    //     color: '',
    //     customColor: '',
    //     width: '',
    //     wicking: '',
    //     firstName: '',
    //     lastName: '',
    //     email: '',
    //     comment: '',
    //     file: null,
    // });

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

    // const handleChange = (e) => {
    //     const { name, value, files } = e.target;
    
    //     // Specific logic for color selection
    //     if (name === "color") {
    //         if (value === "custom") {
    //             setFormData((prevData) => ({
    //                 ...prevData,
    //                 color: value,
    //                 customColor: '', // Reset the custom color if 'custom' is selected
    //             }));
    //         } else {
    //             setFormData((prevData) => ({
    //                 ...prevData,
    //                 color: value,
    //                 customColor: value, // Set the selected color as custom color
    //             }));
    //         }
    //     } else if (name === "colorType") {
    //         if (value === "standard") {
    //             setFormData((prevData) => ({
    //                 ...prevData,
    //                 colorType: value,
    //                 color: '', // Reset the selected color if switching to standard colors
    //             }));
    //         } else {
    //             setFormData((prevData) => ({
    //                 ...prevData,
    //                 colorType: value,
    //             }));
    //         }
    //     } else {
    //         // Update other form fields
    //         setFormData((prevData) => ({
    //             ...prevData,
    //             [name]: files ? files[0] : value,
    //         }));
    //     }
    // };
    
    

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
      
      
    const handleNextStep = () => setStep((prev) => prev + 1);
    const handlePreviousStep = () => setStep((prev) => prev - 1);

    const handleFormDataChange = (section, data) => {
        setFormData((prev) => ({ ...prev, [section]: data }));
    };



    return (
        <>
        <Header />

        <div className='customised-order-container'>
            <div className="customised-steps">
                <span className={step === 1 ? "active" : ""}>1. Custom Options</span>
                <span className={step === 2 ? "active" : ""}>2. Personal Information</span>
                <span className={step === 3 ? "active" : ""}>3. Additional Information</span>
            </div>
            <div className="customised-form-section">
                {step === 1 && (
                    <CustomOptions
                    data={formData.customOptions}
                    onNext={handleNextStep}
                    onChange={(data) => handleFormDataChange('customOptions', data)}
                    />
                )}
                {step === 2 && (
                    <PersonalInfo
                    data={formData.personalInfo}
                    onNext={handleNextStep}
                    onBack={handlePreviousStep}
                    onChange={(data) => handleFormDataChange('personalInfo', data)}
                    />
                )}
                {step === 3 && (
                    <AdditionalInformation
                        data={formData.additionalInformation}
                        onBack={handlePreviousStep}
                        onChange={(data) => handleFormDataChange('additionalInformation', data)}/>
                )}
            </div>
        </div>
        <Footer />
      </>
    );
    
  }
  
  export default CustomisedOrder;