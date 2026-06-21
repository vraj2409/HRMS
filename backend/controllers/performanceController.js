import { dbService } from '../config/db.js';

export const getPerformanceReviews = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'HR') {
      query.employeeId = req.user.id;
    }
    const reviews = await dbService.performanceReviews.find(query);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to query reviews.', error: err.message });
  }
};

export const createPerformanceReview = async (req, res) => {
  const { employeeId, period, rating, comments } = req.body;
  try {
    const review = {
      id: "REV-" + Date.now(),
      employeeId,
      period,
      rating,
      comments,
      reviewer: req.user.name,
      status: 'Completed',
      completedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    const saved = await dbService.performanceReviews.create(review);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log review.', error: err.message });
  }
};
