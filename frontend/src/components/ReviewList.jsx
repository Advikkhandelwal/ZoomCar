import { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import ReviewCard from './ReviewCard';
import './ReviewList.css';

const ReviewList = ({ carId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (carId) {
            fetchReviews();
        }
    }, [carId]);

    const fetchReviews = async () => {
        try {
            const data = await reviewAPI.getCarReviews(carId);
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="no-reviews">
                <p>No reviews yet. Be the first to rent and review this car!</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            <h3>Reviews ({reviews.length})</h3>
            <div className="reviews-grid">
                {reviews.map(review => (
                    <ReviewCard key={review._id} review={review} />
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
