// PersonalInfoForm.js
import {useState, React} from 'react';

const PersonalInfoForm = ({ data, onNext, onBack, onChange }) => {
  const [errors, setErrors] = useState({});


  const validatePhoneNumber = (phone) => {
    // Allow numbers, spaces, and certain symbols (+, -, (, ))
    const phoneRegex = /^\+?[0-9\s\-\(\)]+$/; 
    return phoneRegex.test(phone);
  };

  // Validation function to ensure inputs are all filled out correctly
  const validate = () => {
    if (!data.firstName) {
      alert('First Name is required');
      return false;
    }
    if (!data.lastName) {
      alert('Last Name is required');
      return false;
    }
    if (!data.email) {
      alert('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      alert('Email is invalid');
      return false;
    }
    if (!data.phone) {
    alert('Phone number is required');
    return false;
    }
    if (!validatePhoneNumber(data.phone)) {
    alert('Phone number is invalid');
    return false;
    }
    return true;
  };

  // if all form fields are valid, proceed to the next step
  const handleNextClick = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="form-details">
      <h2 className='custom-heading'>Personal Information</h2>
      <div className="form-custom-group">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={data.firstName || ''}
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={data.lastName || ''}
          onChange={handleChange}
        />
      </div>
      <div className="form-custom-group">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={data.email || ''}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={data.phone || ''}
          onChange={handleChange}
        />
      </div>
      <button onClick={onBack} className='back-custom-button'>Back</button>
      <button onClick={handleNextClick} className='next-custom-button'>Next</button>
    </div>
  );
};

export default PersonalInfoForm;
