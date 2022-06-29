const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies) {
		token = req.cookies.token;
	}

	if (!token) {
		return next(new ErrorResponse('authorization is required', 401));
	}

	try {
		const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

		req.user = await User.findById(decodedToken.id);
	} catch (error) {
		return next(new ErrorResponse('authorization is required', 401));
	}

	next();
});

const authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new ErrorResponse('not authorized', 403));
		}

		next();
	};
};
module.exports = { protect, authorize };
