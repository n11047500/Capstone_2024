import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ReviewPage.css';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

import ReviewCard from '../components/ReviewCard';



import mini_standard_planter_box from '../assets/mini_standard_planter_box.jpg';
import large_planter_tray from '../assets/large_planter_tray.jpg';
import desktop_planter_box from '../assets/desktop_planter_box.jpg';
import accessibility_planter_box from '../assets/accessibility_planter_box.jpg';
import small_standard_planter_box from '../assets/small_standard_planter_box.jpg';
import mini_wicking_planter_box from '../assets/mini_wicking_planter_box.jpg';
import insta_garden_range from '../assets/insta_garden_range.jpg';
import large_standard_planter_box from '../assets/large_standard_planter_box.jpg';
import large_wicking_planter_box from '../assets/large_wicking_planter_box.jpg';
import medium_standard_planter_box from '../assets/medium_standard_planter_box.jpg';
import medium_wicking_planter_box from '../assets/medium_wicking_planter_box.jpg';
import side_table from '../assets/side_table.jpg';
import small_planter_tray from '../assets/small_planter_tray.jpg';
import small_wicking_planter_box from '../assets/small_wicking_planter_box.jpg';
import trellis from '../assets/trellis.jpg';


const imageMap = {
  'Mini Standard Planter Box': mini_standard_planter_box,
  'Small Standard Planter Box': small_standard_planter_box,
  'Medium Standard Planter Box': medium_standard_planter_box,
  'Large Standard Planter Box': large_standard_planter_box,
  'Mini Wicking Planter Box': mini_wicking_planter_box,
  'Small Wicking Planter Box': small_wicking_planter_box,
  'Medium Wicking Planter Box': medium_wicking_planter_box,
  'Large Wicking Planter Box': large_wicking_planter_box,
  'Small Planter Tray': small_planter_tray,
  'Large Planter Tray': large_planter_tray,
  'Desktop Planter Box': desktop_planter_box,
  'Accessibility Planter Box': accessibility_planter_box,
  'Insta Garden Range': insta_garden_range,
  'Side Table': side_table,
  'Trellis': trellis,
};

const ReviewPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/products/${productId}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3001/reviews/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched reviews data:', data);
        setReviews(data.reviews || []);
        setRatings(data.ratings || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        setRatings([]);
      }
    };


    fetchProduct();
    fetchReviews();
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  console.log('Product ID:', productId);
 

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Your review has been submited.');
  }
  
  



  const productImage = imageMap[product.Product_Name];

  return (
    <>
      <Header />
        <div className="review-page-container">
          <div className="product-container product-page">
          <div className="product-image product-page">
                {productImage && <img src={productImage} alt={product.Product_Name} />}
            </div>

            <div className="review description">
              <br />
              <h1 className="review-title review-page">Create a review</h1>
              <br />
              <div className="review-small">
                <span className="star product-page">⭐</span> 4.9 · 142 reviews
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
                        <h3>User ID: {review.user_ID}</h3>
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