// ShippingMethodForm.js
import React from 'react';

const ShippingMethodForm = ({ data, onNext, onBack, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="form-details">
      <h2>Shipping Method</h2>
      <div className="shipping-options">
        <div>
          <input
            type="radio"
            name="shippingOption"
            value="Click and Collect"
            checked={data.shippingOption === 'Click and Collect'}
            onChange={handleChange}
          />
          <label>Click and Collect</label>
        </div>
        <div>
          <input
            type="radio"
            name="shippingOption"
            value="Delivery"
            checked={data.shippingOption === 'Delivery'}
            onChange={handleChange}
          />
          <label>Delivery</label>
        </div>
      </div>
      <button onClick={onBack}>Back</button>
      <button onClick={onNext}>Next</button>
    </div>
  );
};

export default ShippingMethodForm;
