

<div>
<button className="button-review review-page" onClick={() => setIsVisible(!isVisible)}>
  {isVisible ? '142 reviews' : '142 reviews'}
</button>
{!isVisible && (
  <div>
    {product.Product_Options.length > 0 && (
        <select
            className="product-options product-page"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
      >
         <option value="">Select an option</option>
          {product.Product_Options.map((option, index) => (
        <option key={index} value={option}>{option}</option>
         ))}
        </select>
    )}                
    <div className="quantity-container product-page">
      <label htmlFor="quantity" className="product-page">Quantity:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="quantity-input product-page"
        />
    </div>
    <button className="add-to-cart product-page" onClick={handleAddToCart}>
    Add to Cart
    </button>
  </div>
)}

{isVisible && (
  <div>
    <h1 className="review-title review-page">Reviews</h1>
    <p className="review-description review-page">Your Rating: </p>

    <form action="/action.php">

    {[...Array(totalStars)].map((star, index) => {
      const currentRating = index + 1;

        return (
          <label key={index}>
          <input
            key={star}
            type="radio"
            name="rating"
            value={currentRating}
            onChange={() => setRating(currentRating)}
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
      <p className="review-description review-page">Comments: </p>
      <textarea cols="50"></textarea>
      <br />
      <input type="submit" value="Submit"></input>
    </form>
    </div>
)}  
</div>
