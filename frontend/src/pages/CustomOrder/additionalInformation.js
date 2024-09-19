// ShippingMethodForm.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ShippingMethodForm = ({ data, onBack, onChange, onSubmit }) => {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      // Handle file upload separately
      onChange({ ...data, [name]: files[0] }); // Store the first selected file
    } else {
      onChange({ ...data, [name]: value });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
  
    try {
      // Create a new FormData object
      const formDataObj = new FormData();
  
      // Append each field to the FormData object
      formDataObj.append('colorType', data.colorType || '');
      formDataObj.append('color', data.color || '');
      formDataObj.append('customColor', data.customColor || '');
      formDataObj.append('width', data.width || '');
      formDataObj.append('wicking', data.wicking || '');
      formDataObj.append('firstName', data.firstName || '');
      formDataObj.append('lastName', data.lastName || '');
      formDataObj.append('email', data.email || '');
      formDataObj.append('comment', data.comment || '');
  
      // If a file is selected, append it to the FormData object
      if (data.file) {
        formDataObj.append('file', data.file);
      }
  
      // Handle color and customColor logic
      if (data.color && !data.customColor) {
        formDataObj.set('customColor', 'None');
      } else if (!data.color && data.customColor) {
        formDataObj.set('color', 'None');
      } else if (data.color === data.customColor) {
        formDataObj.set('customColor', 'None');
      }
  
      // Send form data to the backend (do not set Content-Type explicitly, let FormData handle it)
      const response = await fetch('http://localhost:3001/submit-form', {
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-details"> 
      <h2>Additional Information</h2>
      <div className="form-custom-group" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
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
          value={data.comment}
          onChange={handleChange}
          required
        />
      </div>

      <button onClick={onBack} className='back-custom-button'>Back</button>
      <button type="submit" className="submit-custom-button">Submit Form</button>
    </form>
  );
};

export default ShippingMethodForm;
