import React from 'react';
import { useLoadScript } from '@react-google-maps/api';

// Define libraries needed for Google Maps API (autocomplete functionality)
const libraries = ['places'];

const PersonalInfoForm = ({ data, onNext, onChange }) => {
  // Access the Google Maps API key from environment variables
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Load the Google Maps script with the necessary libraries
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    id: 'google-maps-script',
  });

  // Handle changes in form inputs and update the data
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  // Handle when the user selects a place from the autocomplete suggestions
  const handlePlaceChanged = (autocomplete) => {
    const place = autocomplete.getPlace();
    // Update the address field with the selected place's formatted address
    if (place && place.formatted_address) {
      onChange({ ...data, address: place.formatted_address });
    }
  };

  // Initialize the autocomplete feature for the address input field
  const initializeAutocomplete = (input) => {
    if (!input || !isLoaded) return;

    // Configure the autocomplete to show only geocoded addresses within Australia
    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['geocode'],
      componentRestrictions: { country: 'AU' },
    });

    // Add a listener to handle when a place is selected
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
        ref={initializeAutocomplete} // Ref to initialize autocomplete on this input
        required
      />
      <button onClick={onNext}>Continue to Shipping</button>
    </div>
  );
};

export default PersonalInfoForm;