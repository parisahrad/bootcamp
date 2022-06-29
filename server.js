const express = require('express');
const dotenv = require('dotenv');
const bootcamp = require('./routs/bootcamp');
const course = require('./routs/course');
const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
const auth = require('./routs/auth');
const cookieParser = require('cookie-parser');
const user = require('./routs/user');
const review = require('./routs/review');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

dotenv.config({ path: './config/config.env' });

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

app.use(fileupload());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 100,
});

app.use(limiter);

app.use(hpp());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger);
app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/courses', course);
app.use('/api/v1/auth', auth);
app.use('/api/v1/user', user);
app.use('/api/v1/reviews', review);
app.use(errorHandler);

const server = app.listen(
	PORT,
	console.log(`server running in ${process.env.NODE_ENV} mode on Port ${PORT}`)
);

process.on('unhandledRejection', (err, promise) => {
	console.log(`ERROR: ${err.message}`);

	server.close(() => process.exit(1));
});
