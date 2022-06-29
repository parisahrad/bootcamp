const mongoose = require('mongoose');
const slugify = require('slugify');

const BootcampSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'please add a name'],
			unique: true,
			trim: true,
			maxlength: 50,
		},
		slug: String,
		description: {
			type: String,
			required: true,
			maxlength: [500, 'description can not be more than 500'],
		},
		website: {
			type: String,
			match:
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
		},
		address: {
			type: String,
			required: true,
		},
		creers: {
			type: [String],
			required: true,
			enum: [
				'Web Development',
				'Mobile Development',
				'UI/UX',
				'Data Science',
				'Bussiness',
				'Other',
			],
		},
		averageRating: {
			type: Number,
			min: 1,
			max: 10,
		},
		averageCost: Number,
		photo: {
			type: String,
			default: 'no-photo.jpg',
		},
		housing: {
			type: Boolean,
			default: false,
		},
		jobAssistance: {
			type: Boolean,
			default: false,
		},
		jobGuarantee: {
			type: Boolean,
			default: false,
		},
		acceptGI: {
			type: Boolean,
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		toObject: { virtuals: true },
		toJson: { virtuals: true },
	}
);

BootcampSchema.pre('remove', async function (next) {
	await this.model('Course').deleteMany({ bootcamp: this._id });
	next();
});

BootcampSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

BootcampSchema.virtual('courses', {
	ref: 'Course',
	localField: '_id',
	foreignField: 'bootcamp',
	justOne: false,
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
