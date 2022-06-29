const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'please add title'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'please add description'],
	},
	weeks: {
		type: String,
		required: [true, 'please add number of weeks'],
	},
	tuition: {
		type: Number,
		required: [true, 'please add tution'],
	},
	minimumSkill: {
		type: String,
		enum: ['intermidiate', 'advanced', 'beginner'],
		required: [true, 'please add minimum skil'],
	},
	scholashipAvailable: {
		type: Boolean,
		default: false,
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

CourseSchema.statics.getAverageCost = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageCost: { $avg: '$tuition' },
			},
		},
	]);

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId),
			{
				averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
			};
	} catch (err) {
		console.log(err);
	}
};

CourseSchema.post('save', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre('remove', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
