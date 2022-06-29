const express = require('express');
const {
	getCourses,
	getSingleCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} = require('../controllers/course');
const advancedFiltering = require('../middleware/advancedFiltering');
const Courses = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(
		advancedFiltering(Courses, {
			path: 'bootcamp',
			select: 'name description',
		}),
		getCourses
	)
	.post(protect, authorize('publisher', 'admin'), createCourse);
router
	.route('/:id')
	.get(getSingleCourse)
	.put(protect, authorize('publisher', 'admin'), updateCourse)
	.delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
