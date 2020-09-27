const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();

  // Build template
  // Render that template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // Build template
  // Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', { title: 'Your account' });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // Find tours with the returned IDs
  const toursIds = bookings.map(el => el.tour.id);
  const tours = await Tour.find({ _id: { $in: toursIds } });

  // Render that template using tours data (reuse 'overview' template)
  res.status(200).render('overview', { title: 'My Tours', tours });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const body = { name: req.body.name, email: req.body.email };
  const updatedUser = await User.findByIdAndUpdate(req.user.id, body, {
    new: true,
    runValidators: true,
  });

  res.status(200).render('account', { title: 'Your account', user: updatedUser });
});
