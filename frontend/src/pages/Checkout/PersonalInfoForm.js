import React from 'react';
import { useLoadScript } from '@react-google-maps/api';

// Define libraries needed for Google Maps API (autocomplete functionality)
const libraries = ['places'];

const PersonalInfoForm = ({ data, onNext, onChange }) => {
  
    // Basic validation function
    const validate = () => {
      // Check if first name is provided
      if (!data.firstName) {
        alert('First Name is required');
        return false;
      }
  
      // Check if last name is provided
      if (!data.lastName) {
        alert('Last Name is required');
        return false;
      }
      
  
      // Check if email is provided and valid
      if (!data.email) {
        alert('Email is required');
        return false;
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        alert('Email is invalid');
        return false;
      }
  
      // Check if phone number is provided and valid
      if (!data.phone) {
        alert('Phone number is required');
        return false;
      }
      if (!validatePhoneNumber(data.phone)) {
        alert('Phone number is invalid');
        return false;
      }
      if (!data.address) {
        alert('Address is required');
        return false;
      }
      // If all validations pass
      return true;
    };
  
    // Phone number validation function
    const validatePhoneNumber = (phone) => {
      // Example regex for phone validation: change as necessary
      const phoneRegex = /^\d{10}$/; // Assuming a 10-digit phone number
      return phoneRegex.test(phone);
    };
  
    const handleNextClick = () => {
      if (validate()) {
        onNext();
      }
    };
  
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
      <h2 className="checkout-heading">Personal Information</h2>
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
      <button type="button" onClick={handleNextClick}>Continue to Shipping</button>
      </div>
  );
};

export default PersonalInfoForm;