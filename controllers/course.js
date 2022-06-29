const asyncHandler = require('../middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

const getCourses = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const courses = await Course.find({ bootcamp: req.params.bootcampId });

		res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedSelect);
	}
});

const getSingleCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!course) {
		return next(
			new ErrorResponse(`no course with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: course,
	});
});

const createCourse = asyncHandler(async (req, res, next) => {
	const bootcampId = req.body.bootcamp;

	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(bootcampId);

	if (!bootcamp) {
		return next(new ErrorHandler('invalid id'), 400);
	}

	const course = await Course.create(req.body);

	res.status(201).json({
		success: true,
		data: course,
	});
});

const updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(new ErrorResponse('no such course', 404));
	}

	console.log(course.user.toString());
	console.log(req.user.id);
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('not authorized', 401));
	}

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: course,
	});
});

const deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course) {
		return next(new ErrorHandler('no such course', 404));
	}

	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('not authorized', 401));
	}

	await course.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});

module.exports = {
	getCourses,
	getSingleCourse,
	createCourse,
	updateCourse,
	deleteCourse,
};
