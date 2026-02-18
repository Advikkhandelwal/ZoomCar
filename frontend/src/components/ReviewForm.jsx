import { useState } from 'react';
import './ReviewForm.css';

const ReviewForm = ({ bookingId, carId, onSubmit, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                bookingId,
                carId,
                rating,
                comment,
            });
        } catch (error) {
            alert('Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <h3>Write a Review</h3>

            <div className="rating-selector">
                <label>Rating *</label>
                <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                    ))}
                </div>
                <p className="rating-text">
                    {rating === 0 ? 'Select a rating' :
                        rating === 1 ? 'Poor' :
                            rating === 2 ? 'Fair' :
                                rating === 3 ? 'Good' :
                                    rating === 4 ? 'Very Good' :
                                        'Excellent'}
                </p>
            </div>

            <div className="form-group">
                <label htmlFor="comment">Your Review</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-textarea"
                    placeholder="Share your experience with this car..."
                    rows="5"
                />
            </div>

            <div className="form-actions">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                )}
                <button type="submit" disabled={loading || rating === 0} className="btn btn-primary">
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
