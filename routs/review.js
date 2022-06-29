const express = require('express');
const {
	getReviews,
	getSingleReview,
	createReview,
	updateReview,
	deleteReview,
} = require('../controllers/review');
const advancedFiltering = require('../middleware/advancedFiltering');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(
		advancedFiltering(Review, {
			path: 'bootcamp',
			select: 'name description',
		}),
		getReviews
	)
	.post(protect, authorize('admin', 'user'), createReview);

router
	.route('/:id')
	.get(getSingleReview)
	.put(protect, authorize('user', 'admin'), updateReview)
	.delete(protect, authorize('user', 'admin'), deleteReview);
module.exports = router;
