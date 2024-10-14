import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ReviewPage.css';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';

const ReviewPage = () => {
  // Extract the product ID from the URL
  const { productId } = useParams();
  // State variables for product details, reviews, ratings, and error handling
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [productError, setProductError] = useState(null); // Separate error for product
  const [reviewError, setReviewError] = useState(null); // Separate error for reviews

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    // Fetch product details based on the product ID
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProductError('Failed to load product details');
      }
    };

    // Fetch reviews and ratings for the product
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews/${productId}`);
        if (!response.ok) {
          // No error thrown here for HTTP 404 (not found), handle gracefully
          setReviews([]); // Ensure reviews are reset if not found
          setRatings([]);
          setReviewCount(0);
          setAverageRating(0);
          return; // Skip further processing
        }
        const data = await response.json();
        setReviews(data.reviews || []);
        setRatings(data.ratings || []);
        setReviewCount(data.reviewCount || 0);
        setAverageRating(data.averageRating || 0);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewError('Failed to load reviews');
        setReviews([]);
        setRatings([]);
        setReviewCount(0);
        setAverageRating(0);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [productId]);

  
  const addReview = (newReview, newRating) => {
    // Add the new review and rating to the existing state
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setRatings((prevRatings) => [newRating, ...prevRatings]);
    setReviewCount((prevCount) => prevCount + 1);

    // Update average rating
    const totalRatings = (averageRating * reviewCount) + newRating;
    setAverageRating(totalRatings / (reviewCount + 1));
  };
  
  // Handle error for product loading
  if (productError) {
    return <div>Error: {productError}</div>;
  }

  // Show loading state until product is loaded
  if (!product) {
    return <div>Loading...</div>;
  }

  // Product image and rating formatter
  const productImage = product.Product_Image_URL;
  const ratingFormatter = new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  // Calculate the total number of pages for reviews
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  
  // Determine the reviews to display on the current page
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Handlers for pagination buttons
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <Header />
      <div className="review-page-container">
        <div className="product-container product-page">
          <div className="product-image product-page">
            {productImage && <img src={productImage} alt={product.Product_Name} />}
          </div>
          <div className="review-description">
            <h1 className="review-title review-page">Create a review</h1>
            <div className="review-small">
              <span className="star product-page">⭐</span> {ratingFormatter.format(averageRating)} · {reviewCount} reviews
            </div>
            <ReviewForm productId={productId} addReview={addReview} />
          </div>
        </div>
      </div>

      <div className="user-comments-container">
        <h1>Reviews</h1>
        {reviewError ? (
          <div>Error: {reviewError}</div>
        ) : currentReviews.length > 0 ? (
          <ul className="comments-flex">
            {currentReviews.map((review, index) => (
              <li key={index} className="user-comments">
                <h3>{review.first_name ? review.first_name : 'Guest User'}</h3>
                <StarRating rating={ratings[index]} />
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews for this product.</p>
        )}

        {/* Pagination controls for navigating reviews */}
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReviewPage;
