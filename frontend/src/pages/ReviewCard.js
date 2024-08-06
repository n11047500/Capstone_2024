import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ReviewContent({ productId, user_id, rating}) {
  return (
    <Link to={`/product/${productId}`} className="product-card-link">
      <div className="product-card">
        {image && (
          <div className="product-image">
            <img src={image} alt={title} />
          </div>
        )}
        <div className="product-title">{user_id}</div>
        <div className="product-price">{rating}</div>
      </div>
    </Link>
  );
}

export default ReviewContent;
