import React from 'react';
import './ProductCard.css';

function ProductCard({ title, price, image }) {
  return (
    <div className="product-card">
      {image && (
        <div className="product-image">
          <img src={image} alt={title} />
        </div>
      )}
      <div className="product-title">{title}</div>
      <div className="product-price">{price}</div>
    </div>
  );
}

export default ProductCard;
