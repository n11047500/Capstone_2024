import React from 'react';
import { useLoadScript } from '@react-google-maps/api';
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Load the Google Maps script
const libraries = ['places'];

const PersonalInfoForm = ({ data, onNext, onChange }) => {
  // Load the Google Maps script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey, // Replace with your Google Maps API Key
    libraries,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handlePlaceChanged = (autocomplete) => {
    const place = autocomplete.getPlace();
    if (place && place.formatted_address) {
      onChange({ ...data, address: place.formatted_address });
    }
  };

  // Initialize the autocomplete input once the Google Maps script is loaded
  const initializeAutocomplete = (input) => {
    if (!input || !isLoaded) return;

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['geocode'],
      componentRestrictions: { country: 'AU' }, // Restrict to Australian addresses
    });

    autocomplete.addListener('place_changed', () => handlePlaceChanged(autocomplete));
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
        ref={initializeAutocomplete}
        required
      />
      <button onClick={onNext}>Continue to Shipping</button>
    </div>
  );
};

export default PersonalInfoForm;
