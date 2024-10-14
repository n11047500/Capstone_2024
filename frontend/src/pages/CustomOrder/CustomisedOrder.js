import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './CustomisedOrder.css';
import PersonalInfo from './personalInfo';
import CustomOptions from './customOptions';
import AdditionalInformation from './additionalInformation';


const CustomisedOrder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customOptions: {},
        personalInfo: {},
        additionalInformation: {},
    });

    // isSubmitting and setIsSubmitting used to prevent multiple form submissions
    const [isSubmitting, setIsSubmitting] = useState(false); // Define isSubmitting state


    const handleNextStep = () => setStep((prev) => prev + 1);

    const handlePreviousStep = () => setStep((prev) => prev - 1);

    const handleFormDataChange = (section, data) => {
        console.log(section, data); // Check if 'personalInfo' and the correct email data are logged
        setFormData((prev) => ({ ...prev, [section]: data }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault(); // Prevent default form submission

      // Check if already submitting
      if (isSubmitting) {
          return; // Exit if form is already being submitted
      }

      setIsSubmitting(true); // Set submitting state to true

      // Combine all form data from different sections (customOptions, personalInfo, additionalInformation)
      const combinedFormData = {
          ...formData.customOptions,     // Data from step 1
          ...formData.personalInfo,      // Data from step 2 (this includes the email)
          ...formData.additionalInformation // Data from step 3 (current step)
      };

      console.log('Combined Form Data:', combinedFormData); // You can see the full form data here
      console.log('Email value:', combinedFormData.email);   // Check if the email is present

      try {
          // Create a new FormData object
          const formDataObj = new FormData();

          // Append each field to the FormData object from combinedFormData
          Object.keys(combinedFormData).forEach((key) => {
              formDataObj.append(key, combinedFormData[key] || '');
          });

          // If file is available in formData
          if (formData.file) { // Check your state where the file is stored
              console.log('Attaching file:', formData.file);
              formDataObj.append('file', formData.file);
          }

          // Handle color and customColor logic
          if (combinedFormData.color && !combinedFormData.customColor) {
              formDataObj.set('customColor', 'None');
          } else if (!combinedFormData.color && combinedFormData.customColor) {
              formDataObj.set('color', 'None');
          } else if (combinedFormData.color === combinedFormData.customColor) {
              formDataObj.set('customColor', 'None');
          }

          // Send form data to the backend (do not set Content-Type explicitly, let FormData handle it)
          const response = await fetch(`${process.env.REACT_APP_API_URL}/submit-form`, {
              method: 'POST',
              body: formDataObj,
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
      } finally {
          setIsSubmitting(false); // Reset submitting state regardless of success or failure
      }
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
                        onChange={(data) => handleFormDataChange('additionalInformation', data)}
                        formData={formData}
                        onSubmit={handleSubmit}
                        />
                )}
            </div>
        </div>
        <Footer />
      </>
    );
    
  }
  
  export default CustomisedOrder;