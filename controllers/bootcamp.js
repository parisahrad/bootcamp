const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');

const getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`bootcamp with id ${req.params.id} not found`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

const getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedSelect);
});

const createBootcamp = asyncHandler(async (req, res, next) => {
	req.body.user = req.user.id;

	const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

	if (publishedBootcamp && req.user.role !== 'admin') {
		return next(new ErrorResponse('you already published one bootcamp', 400));
	}

	const bootcamp = await Bootcamp.create(req.body);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`bootcamp with id ${req.params.id} not found`, 404)
		);
	}

	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

const updateBootcamp = asyncHandler(async (req, res, next) => {
	let bootcamp = await Bootcamp.findById(req.params.id, req.body);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`bootcamp with id ${req.params.id} not found`, 404)
		);
	}

	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('not authorized', 401));
	}

	bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

const deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`bootcamp with id ${req.params.id} not found`, 404)
		);
	}

	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('not authorized', 401));
	}

	bootcamp.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});

const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`bootcamp with id ${req.params.id} not found`, 404)
		);
	}

	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('not authorized', 401));
	}

	if (!req.files) {
		return next(new ErrorResponse('please upload photo', 400));
	}

	const file = req.files.files;

	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse('please upload an image file', 400));
	}

	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`please upload an image file lesser than ${process.env.MAX_FILE_UPLOAD}`,
				400
			)
		);
	}

	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			return next(new ErrorResponse(`problem with file upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

		res.status(200).json({
			success: true,
			data: file.name,
		});
	});
});

module.exports = {
	getBootcamp,
	getBootcamps,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	bootcampPhotoUpload,
};
