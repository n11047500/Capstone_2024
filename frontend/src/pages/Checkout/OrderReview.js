// OrderReview.js
import React from 'react';

const OrderReview = ({ data, onBack, onSubmit }) => {
  return (
    <div className="form-section">
      <h2>Review Your Order</h2>
      <p><strong>Name:</strong> {data.personalInfo.firstName} {data.personalInfo.lastName}</p>
      <p><strong>Email:</strong> {data.personalInfo.email}</p>
      <p><strong>Shipping Option:</strong> {data.shippingMethod.shippingOption}</p>
      <button onClick={onBack}>Back</button>
      <button onClick={onSubmit}>Confirm Order</button>
    </div>
  );
};

export default OrderReview;
