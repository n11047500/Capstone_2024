import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
// IGNORE REVIEW CARD WAS AN IDEA THAT FAILED 
function ReviewContent({ productId, review_id, user_id, rating, comment}) {
  return (
    <Link to={`/product/${productId}`} className="product-card-link">
      <div className="product-card">
        <div className="product-title">{user_id}</div>
        <div className="product-title">{review_id}</div>
        <div className="product-price">{rating}</div>
        <div className="product-price">{rating}</div>

      </div>
    </Link>
  );
}

export default ReviewContent;
