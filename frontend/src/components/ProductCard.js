import React from 'react';
import './ProductCard.css';

function ProductCard({ title, price }) {
  return (
    <div className="product-card">
      <div className="product-image">Product Image</div>
      <div className="product-title">{title}</div>
      <div className="product-price">{price}</div>
    </div>
  );
}

export default ProductCard;
