const asyncHandler = require('../middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');

const getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });

		res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedSelect);
	}
});

const getSingleReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(`no review with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: review,
	});
});

const createReview = asyncHandler(async (req, res, next) => {
	req.body.user = req.user.id;
	req.body.bootcamp = req.params.bootcampId;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(new ErrorResponse(`no such bootcamp`, 404));
	}

	const review = await Review.create(req.body);

	res.status(201).json({
		success: true,
		data: review,
	});
});

const updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	if (!review) {
		return next(new ErrorResponse(`not found`, 404));
	}

	if (req.user.id !== review.user.toString() && req.user.role !== 'admin') {
		return next(new ErrorResponse(`not authorized`, 401));
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body);

	res.status(200).json({
		success: true,
		data: review,
	});
});

const deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return next(new ErrorResponse(`not found`, 404));
	}

	if (req.user.id !== review.user.toString() && req.user.role !== 'admin') {
		return next(new ErrorResponse(`not authorized`, 401));
	}

	await Review.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});

module.exports = {
	getReviews,
	getSingleReview,
	createReview,
	updateReview,
	deleteReview,
};
