const express = require('express');
const {
	getBootcamp,
	getBootcamps,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	bootcampPhotoUpload,
} = require('../controllers/bootcamp');
const courseRouter = require('./course');
const Bootcamp = require('../models/Bootcamp');
const advancedFiltering = require('../middleware/advancedFiltering');
const { protect, authorize } = require('../middleware/auth');
const reviewRouter = require('./review');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
	.route('/:id/photo')
	.put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);
router
	.route('/')
	.get(advancedFiltering(Bootcamp, 'courses'), getBootcamps)
	.post(protect, authorize('publisher', 'admin'), createBootcamp);
router
	.route('/:id')
	.get(getBootcamp)
	.put(protect, authorize('publisher', 'admin'), updateBootcamp)
	.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
