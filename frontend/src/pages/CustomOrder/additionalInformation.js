// ShippingMethodForm.js
import React from 'react';

const ShippingMethodForm = ({ data, onBack, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="form-details">
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

      <button onClick={onBack}>Back</button>
      <button type="submit" className="submit-button">Submit Form</button>
    </div>
  );
};

export default ShippingMethodForm;
