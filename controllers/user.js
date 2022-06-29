const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getAllUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedSelect);
});

const getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

const createUser = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body);

	res.status(201).json({
		success: true,
		data: user,
	});
});

const updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

const deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});

module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser };
