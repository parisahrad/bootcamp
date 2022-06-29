const advancedFiltering = (model, populating) => async (req, res, next) => {
	let query;

	const reqQuery = { ...req.query };

	const removedFields = ['select', 'sort', 'page', 'limit'];

	removedFields.forEach((param) => delete reqQuery[param]);

	let queryStr = JSON.stringify(reqQuery);

	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	query = model.find(JSON.parse(queryStr));

	if (populating) {
		query = query.populate(populating);
	}

	if (req.query.select) {
		const select = req.query.select.split(',').join(' ');
		query.select(select);
	}

	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query.sort(sortBy);
	} else {
		query.sort('-createdAt');
	}

	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 4;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();
	const pagination = {};

	query.skip(startIndex).limit(limit);

	if (endIndex < total) {
		pagination.next = { page: page + 1, limit };
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	const result = await query;

	res.advancedSelect = {
		success: true,
		count: result.length,
		pagination,
		data: result,
	};

	next();
};

module.exports = advancedFiltering;
