import React from 'react';

const AdditionalInformation = ({ data, onBack, onChange, onSubmit, isSubmitting, setIsSubmitting }) => {

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      // Handle file upload separately
      onChange({ ...data, [name]: files[0] }); // Store the first selected file
    } else {
      onChange({ ...data, [name]: value });
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-details"> 
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
      <button type="submit" className="submit-custom-button" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Form'}
      </button>
    </form>
  );
};

export default AdditionalInformation;
