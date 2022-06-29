const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	const user = await User.create({ name, email, password, role });

	sendTokenResponse(user, 200, res);
});

const login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new ErrorResponse('please provide email and password', 400));
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorResponse('invalid credential', 401));
	}

	const isMatched = await user.matchPassword(password);

	if (!isMatched) {
		return next(new ErrorResponse('invalid credential', 401));
	}

	sendTokenResponse(user, 200, res);
});

const sendTokenResponse = async (user, statusCode, res) => {
	const token = await user.getJwtToken();

	const options = {
		httpOnly: true,
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		secure: process.env.NODE_ENV === 'production' ? true : false,
	};

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};

const getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

const forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse('no such user with this email exists', 404));
	}

	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/auth/reset-password/${resetToken}`;

	const message = `you requested a reset password: \n\n ${resetURL}`;

	try {
		await sendEmail({
			text: message,
			subject: 'DevCamper Reset Password',
			email: user.email,
		});

		res.status(200).json({
			success: true,
		});
	} catch (err) {
		user.resetPasswordExpire = undefined;
		user.resetPasswordToken = undefined;

		await user.save({ validateBeforeSave: false });
		return next(new ErrorResponse(err.message, 500));
	}
});

const resetPassword = asyncHandler(async (req, res, next) => {
	const resetToken = crypto
		.createHash('sha256')
		.update(req.params.resetToken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken: resetToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse('inalid reset token ', 400));
	}

	user.password = req.body.password;
	user.resetPasswordExpire = undefined;
	user.resetPasswordToken = undefined;

	user.save();

	sendTokenResponse(user, 200, res);
});

const updateUserInfo = asyncHandler(async (req, res, next) => {
	const fieldsToBeUpdated = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToBeUpdated, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

const updateUserPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('invalid password', 401));
	}

	user.password = req.body.newPassword;

	await user.save();

	sendTokenResponse(user, 200, res);
});

const logout = asyncHandler(async (req, res, next) => {
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 5 * 1000),
		httpOnly: true,
	});
	res.status(200).json({
		success: true,
		data: {},
	});
});

module.exports = {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	updateUserInfo,
	updateUserPassword,
	logout,
};
