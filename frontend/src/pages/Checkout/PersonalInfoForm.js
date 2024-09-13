// PersonalInfoForm.js
import React from 'react';

const PersonalInfoForm = ({ data, onNext, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="form-details">
      <h2>Personal Information</h2>
      <div className="form-group">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={data.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={data.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={data.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={data.phone}
          onChange={handleChange}
          required
        />
      </div>
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={data.address}
        onChange={handleChange}
        required
      />
      <button onClick={onNext}>Continue to Shipping</button>
    </div>
  );
};

export default PersonalInfoForm;
