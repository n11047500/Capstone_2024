import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ReviewPage.css';


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
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [totalStars, setTotalStars] = useState(5);

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

    fetchProduct();
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
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
    </>
  );
}

export default ReviewPage;