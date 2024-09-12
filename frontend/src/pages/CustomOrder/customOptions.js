import React from 'react';

const customOptions = ({ data, onNext, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="customised-order-form">
      <h2>Custom Options</h2>
      <div className="custom-form-group">
      <div className="form-custom-group">
        <label>Select Colour:</label>
        <div className="radio-group-container">
          <div className="radio-group">
            <label htmlFor="standard" className="label-small">Standard.. </label>
            <input
              type="radio"
              name="colorType"
              value="standard"
              checked={data.colorType === 'standard'}
              onChange={handleChange}
            />
          </div>

          <div className="radio-group">
            <label htmlFor="custom" className="label-small">Custom.. </label>
            <input
              type="radio"
              name="colorType"
              value="custom"
              checked={data.colorType === 'custom'}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <br />

      <div className="form-custom-group">
        {data.colorType === 'standard' && (
          <select
            name="color"
            value={data.color}
            onChange={handleChange}
            required
          >
            <option value="">Select a color</option>
            <optgroup label="Ezee Standard Colors">
              {/* {productColour.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))} */}
            </optgroup>
          </select>
        )}
        {data.colorType === 'custom' && (
          <input
            type="text"
            name="customColor"
            value={data.customColor}
            placeholder="Enter Custom Color"
            onChange={handleChange}
            required
          />
        )}
      </div>

      <div className="form-custom-group">
        <label>Width (cm):</label>
        <input
          type="number"
          name="width"
          value={data.width}
          onChange={handleChange}
          placeholder="Enter width in cm"
          min="0"
        />
      </div>
      <div className="form-custom-group">
        <label>Wicking:</label>
        <div className="radio-group-container">
          <div className="radio-group">
            <label className="label-small">Yes </label>
            <input
              type="radio"
              name="wicking"
              value="yes"
              checked={data.wicking === 'yes'}
              onChange={handleChange}
            />
          </div>

          <div className="radio-group">
            <label className="label-small">No </label>
            <input
              type="radio"
              name="wicking"
              value="no"
              checked={data.wicking === 'no'}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <button onClick={onNext}>Next</button>
    </div>
    </div>
  );
}

export default customOptions;
