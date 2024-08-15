import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ReviewPage.css';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';


const ReviewPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched reviews data:', data);
        setReviews(data.reviews || []);
        setRatings(data.ratings || []);
        setReviewCount(data.reviewCount || 0); // Set review count from the response
        setAverageRating(data.averageRating || 0); // Set average rating from the response
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error.message);
        setReviews([]);
        setRatings([]);
        setReviewCount(0); // Set default review count in case of error
        setAverageRating(0); // Set default average rating in case of error
      }
    };    


    fetchProduct();
    fetchReviews();
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  console.log('Product ID:', productId);
   
  



  const productImage = product.Product_Image_URL;

  return (
    <>
      <Header />
        <div className="review-page-container">
          <div className="product-container product-page">
            <div className="product-image product-page">
                {productImage && <img src={productImage} alt={product.Product_Name} />}
            </div>

            <div className="review-description">
              <br />
              <h1 className="review-title review-page">Create a review</h1>
              <br />
              <div className="review-small">
                <span className="star product-page">⭐</span> {averageRating.toFixed(1)} · {reviewCount} reviews
                {/*Displays average rating to one decimal place and the total number of reviews for said product*/}
              </div>

              <br />
              <br />

              
                <ReviewForm productId={productId} />
                  
            </div>
          </div>
        </div>

          <div className="user-comments-container">
            <div>
              <h1>Reviews</h1>
              
              {reviews.length > 0 ? (
              <ul>
                <div classname="comments-flex">
                  <div className="user-comments">

                    {reviews.map((review, index) => (
                      <li key={index}>
                        <h3>{review.first_name ? review.first_name : 'Guest User'}</h3>
                        <StarRating rating={ratings[index]} /> {/* Display star rating */}
                        <p>{review.comment}</p>
                        <br />
                      </li>
                    ))}
                  </div>
                </div>
              </ul>
               ) : (
                <p>No reviews for this product.</p>
               )}

            </div>
          </div>          
      <Footer />
    </>
  );
}

export default ReviewPage;