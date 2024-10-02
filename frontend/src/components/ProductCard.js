import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ productId, title, price, image }) {
  return (
    <Link to={`/product/${productId}`} className="product-card-link">
      <article className="product-card">
        {image && (
          <div className="product-image">
            <img src={image} alt={title} />
          </div>
        )}
        <div className="product-title">{title}</div>
        <div className="product-price">{price}</div>
      </article>
    </Link>
  );
}

export default ProductCard;
