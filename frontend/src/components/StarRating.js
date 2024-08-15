import React from 'react';
import PropTypes from 'prop-types';
import './StarRating.css';

const StarRating = ({ rating, maxStars = 5 }) => {
  // Ensure rating is within bounds
  const starRating = Math.min(Math.max(rating, 0), maxStars);

  // Generate an array of stars based on the rating
  const stars = Array.from({ length: maxStars }, (_, index) => {
    const starValue = index + 1;
    return (
      <span
        key={index}
        className={`star ${starValue <= starRating ? 'filled' : ''}`}
        aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
      >
        ★
      </span>
    );
  });

  return <div className="star-rating">{stars}</div>;
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maxStars: PropTypes.number
};

export default StarRating;
