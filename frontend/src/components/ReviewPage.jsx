import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./ReviewPage.css";

function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: "",
    email: "",
    comment: "",
    rating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleStarClick = (star) => {
    setNewReview({ ...newReview, rating: star });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, comment, rating } = newReview;
    if (!name || !email || !comment || !rating) {
      alert("Please fill all fields and select a rating!");
      return;
    }
    // POST to backend
    axios.post('http://localhost:5001/api/reviews', newReview)
      .then(res => {
        // refresh list with new review prepended
        fetchReviews();
        setNewReview({ name: "", email: "", comment: "", rating: 0 });
        setHoverRating(0);
      })
      .catch(err => {
        console.error('Failed to save review', err);
        alert('Failed to save review. Please try again.');
      });
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/reviews');
      if (res.data && res.data.reviews) setReviews(res.data.reviews);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="review-page">
      <h2>Customer Feedback</h2>

      {/* Display Submitted Reviews */}
      <div className="review-list">
        {reviews.map((r, idx) => (
          <div key={idx} className="review-card">
            <h4>{r.name} ({r.email})</h4>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i}>{i <= r.rating ? "⭐" : "☆"}</span>
              ))}
            </div>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>

      {/* Feedback Form */}
      <form className="review-form" onSubmit={handleSubmit}>
        <h3>Leave Your Feedback</h3>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={newReview.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={newReview.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="comment"
          placeholder="Write your feedback..."
          value={newReview.comment}
          onChange={handleChange}
          required
        ></textarea>

        {/* Interactive 5-Star Rating */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || newReview.rating);
            return (
              <span
                key={star}
                className={filled ? "filled" : ""}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(star)}
              >
                {filled ? "⭐" : "☆"}
              </span>
            );
          })}
        </div>

        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
}

export default ReviewPage;

