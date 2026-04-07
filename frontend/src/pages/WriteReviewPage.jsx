import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../services/api';
import './WriteReviewPage.css';

const WriteReviewPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkEligibility();
    }, [bookingId]);

    const checkEligibility = async () => {
        try {
            // First verify booking exists and try to fetch it
            const bookingData = await bookingAPI.getBookingById(bookingId);
            setBooking(bookingData);

            if (bookingData.status !== 'COMPLETED' && bookingData.status !== 'completed') { // Handle case inconsistency
                setError('You can only review completed bookings.');
                return;
            }

        } catch (err) {
            console.error('Error fetching booking:', err);
            setError('Booking not found or unexpected error.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await reviewAPI.createReview({
                carId: booking.car.id || booking.car._id, // Handle different ID formats if any
                bookingId: booking.id || booking._id,
                rating,
                comment
            });
            alert('Review submitted successfully!');
            navigate(`/cars/${booking.car.id || booking.car._id}`);
        } catch (err) {
            console.error('Submit review error:', err);
            setError(err.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    if (error) {
        return (
            <div className="container">
                <div className="error-message">
                    <h2>Unable to Review</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/bookings')} className="btn btn-primary">Back to Bookings</button>
                </div>
            </div>
        );
    }

    return (
        <div className="write-review-page">
            <div className="container">
                <div className="review-form-container">
                    <h1>Write a Review</h1>
                    <div className="booking-summary">
                        <img
                            src={booking?.car?.image || 'https://via.placeholder.com/150'}
                            alt={booking?.car?.model}
                            className="car-thumbnail"
                        />
                        <div>
                            <h3>{booking?.car?.brand} {booking?.car?.model}</h3>
                            <p>Trip: {new Date(booking?.startDate).toLocaleDateString()} - {new Date(booking?.endDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Rating</label>
                            <div className="star-rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${star <= rating ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="comment">Your Experience</label>
                            <textarea
                                id="comment"
                                rows="5"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="form-input"
                                placeholder="Tell us about your trip..."
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => navigate('/bookings')} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WriteReviewPage;
