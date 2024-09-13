import React from 'react';
import deliveryTruck from '../../assets/delivery_truck.svg';
import clickAndCollect from '../../assets/click_and_collect.svg';

const ShippingMethodForm = ({ data, onNext, onBack, onChange }) => {
  const handleChange = (value) => {
    onChange({ ...data, shippingOption: value });
  };

  const handleNextClick = () => {
    if (!data.shippingOption) {
      alert('Please select a shipping option before proceeding.');
      return;
    }
    onNext();
  };

  return (
    <div className="form-details">
      <h2>Shipping Method</h2>
      <div className="shipping-options">
        {/* Click and Collect Option */}
        <div
          className={`shipping-option ${data.shippingOption === 'Click and Collect' ? 'selected' : ''}`}
          onClick={() => handleChange('Click and Collect')}
        >
          <img
            src={clickAndCollect}
            alt="Click and Collect"
            className="shipping-image"
          />
          <br />
          <label>Click and Collect</label>
        </div>

        {/* Delivery Option */}
        <div
          className={`shipping-option ${data.shippingOption === 'Delivery' ? 'selected' : ''}`}
          onClick={() => handleChange('Delivery')}
        >
          <img
            src={deliveryTruck}
            alt="Delivery"
            className="shipping-image"
          />
          <br />
          <label>Delivery</label>
        </div>
      </div>
      <button onClick={onBack}>Back</button>
      <button onClick={handleNextClick} className='next-button' disabled={!data.shippingOption}>
        Next
      </button>
    </div>
  );
};

export default ShippingMethodForm;
