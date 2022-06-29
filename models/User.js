const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'please add name'],
	},
	email: {
		type: String,
		required: true,
		unique: true,
		match:
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi,
	},
	role: {
		type: String,
		enum: ['user', 'publisher'],
		default: 'user',
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		select: false,
	},
	resetPasswordToken: {
		type: String,
	},
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);

	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getJwtToken = async function () {
	return await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

UserSchema.methods.matchPassword = async function (enteredPAssword) {
	return await bcrypt.compare(enteredPAssword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
	const resetToken = crypto.randomBytes(20).toString('hex');

	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
