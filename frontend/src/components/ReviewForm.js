import React, { useState } from 'react';
import './ReviewForm.css'
import { Filter } from 'bad-words';   // Importing Filter for profanity checks

const ReviewForm = ({ productId, onReviewSubmit }) => {
  // State variables for star rating, comments and error handling
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!rating || !comment) {
      setError('Both rating and comment are required.');    //Checks if rating and comments are inputted 
      return;
    }
  
    // Initialize Filter class
    const filter = new Filter();
    const cleanComment = filter.clean(comment); // Censor the comment here
  
    // Check if the comment is clean or has bad words
    if (comment !== cleanComment) {
      setError('Your comment contains inappropriate language. Please revise it.');
      return;
    }    

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, rating, comment }),  // Ensure productId is defined
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Review submitted:', data);
      setRating('');
      setComment('');
      setError('');
      
      // Call the parent function to update reviews on the page
      onReviewSubmit({ rating, comment, first_name: 'Guest User' });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      console.log('Product ID:', productId);
      console.log('Rating:', rating);
      console.log('Comment:', comment);

      setError('Failed to submit review');
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <label className='review-description-title'>Your Rating:</label>
      <br />
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <React.Fragment key={star}>
            <input
              id={`rating${star}`}
              type="radio"
              name="rating"
              value={star}
              checked={rating === String(star)}
              onChange={(e) => setRating(e.target.value)}
            />
            <label htmlFor={`rating${star}`}>{star}</label>
          </React.Fragment>
        ))}
      </div>
        <br />
        <br />
      <label className="review-description-title">Comments:</label>
      <br />
      <textarea
        className="comment-text"
        cols="70"
        rows="8"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <br />
      <br />

      {error && <p className="error">{error}</p>}

      <button className="submit-review" type="submit">Submit</button>
    </form>
  );
};

export default ReviewForm;
