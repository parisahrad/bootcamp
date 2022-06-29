const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'please add title'],
		trim: true,
		maxlength: 100,
	},
	text: {
		type: String,
		required: [true, 'please add some text'],
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [true, 'please add rating'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
});

ReviewSchema.index({ user: 1, bootcamp: 1 }, { unique: true });

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageRating: { $avg: '$rating' },
			},
		},
	]);

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId),
			{
				averageRating: obj[0].averageRating,
			};
	} catch (err) {
		console.log(err);
	}
};

ReviewSchema.post('save', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.pre('remove', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
