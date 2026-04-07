import { memo } from 'react';
import './ReviewCard.css';

const ReviewCard = memo(({ review }) => {
    const { user, rating, comment, createdAt } = review;

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="reviewer-avatar">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="reviewer-name">{user?.name || 'Anonymous'}</div>
                        <div className="review-date">
                            {new Date(createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
                <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={i < rating ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            className={i < rating ? 'filled' : ''}
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ))}
                </div>
            </div>
            {comment && (
                <p className="review-comment">{comment}</p>
            )}
        </div>
    );
});

export default ReviewCard;
