import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ReviewPage.css';


import mini_standard_planter_box from '../assets/mini_standard_planter_box.jpg';



function ReviewPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [totalStars, setTotalStars] = useState(5);

  /*useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/reviews`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }*/


  return (
    <div className="Reviews">
      <Header />
        <div className="review-page-container">
          <div className="product-container product-page">
          <div className="product-image product-page">
              <img src={mini_standard_planter_box} />
            </div>

            <div className="review description">
              <br />
              <h1 className="review-title review-page">Create a review</h1>
              <br />
              <div className="review-small">
                <span className="star product-page">⭐</span> 4.9 · 142 reviews
              </div>
              <br /><br />
                <p className="review-description-title">Your Rating: </p>

                  <form action="/action.php">

                  {[...Array(totalStars)].map((star, index) => {
                    const currentRating = index + 1;

                      return (
                        <label key={index}>
                        <input
                          key={star}
                          type="radio"
                          size="10"
                          name="rating"
                          value={currentRating}
                          onChange={() => setRating(currentRating)}
                          required
                        />
                        <span
                          className="star review-page"
                          style={{
                            color:
                              currentRating <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                          }}
                          onMouseEnter={() => setHover(currentRating)}
                          onMouseLeave={() => setHover(null)}
                        >
                          &#9733;
                        </span>
                        </label>
                      );
                  })}
                    <br />
                    <br />
                    <p className="review-description-title">Comments: </p>
                    <textarea className="comment-text" cols="70" rows="8" required></textarea>
                    <br />
                    <br />
                    <input className="submit-review" type="submit" value="Submit"></input>
                  </form>
                  </div>
              </div>
          </div>
          <div className="user-comments-container">
            <div>
              <h1>Reviews</h1>
                  <div className="user-comments">
                    <h2>User1  ⭐⭐⭐⭐⭐</h2>
                    <p>This is a very good product. 10 out of 10.</p>
                  </div>
                  <br />
                  <div className="user-comments">
                    <h2>User2</h2>
                    <p>This is a very good product. 10 out of 10.</p>
                  </div>
                  <br />
                  <div className="user-comments">
                    <h2>User3</h2>
                    <p>This is a very good product. 10 out of 10.</p>
                  </div>

            </div>
          </div>          
      <Footer />
    </div>
  );
}

export default ReviewPage;