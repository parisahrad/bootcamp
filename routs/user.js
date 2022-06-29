const express = require('express');
const {
	getAllUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require('../controllers/user');
const { protect, authorize } = require('../middleware/auth');
const advancedFiltering = require('../middleware/advancedFiltering');
const router = express.Router();
const User = require('../models/User');

router.use(protect);
router.use(authorize('admin'));
router.route('/').get(advancedFiltering(User), getAllUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
