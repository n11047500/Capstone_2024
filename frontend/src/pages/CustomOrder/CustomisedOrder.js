import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './CustomisedOrder.css';
import PersonalInfo from './personalInfo';
import CustomOptions from './customOptions';
import AdditionalInformation from './additionalInformation';


const CustomisedOrder = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customOptions: {},
        personalInfo: {},
        additionalInformation: {},
    });

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