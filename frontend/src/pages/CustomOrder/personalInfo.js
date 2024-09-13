// PersonalInfoForm.js
import React from 'react';

const PersonalInfoForm = ({ data, onNext, onBack, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="form-details">
      <h2>Personal Information</h2>
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
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={data.address || ''}
        onChange={handleChange}
      />
      <button onClick={onBack}>Back</button>
      <button onClick={onNext} className='next-button'>Next</button>
    </div>
  );
};

export default PersonalInfoForm;
