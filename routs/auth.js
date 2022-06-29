const express = require('express');
const {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	updateUserInfo,
	updateUserPassword,
	logout,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resetToken').put(resetPassword);
router.route('/update-user-info').put(protect, updateUserInfo);
router.route('/update-password').put(protect, updateUserPassword);
router.route('/logout').get(logout);

module.exports = router;
