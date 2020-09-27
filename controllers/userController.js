const multer = require('multer');
const sharp = require('sharp');
const factory = require('./handlerFactory');
const { multerStorageMode, multerFilter } = require('./multerStorageController');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.uploadUserPhotoToMemory = multer({
  storage: multerStorageMode('user').memory,
  fileFilter: multerFilter,
}).single('photo');

// exports.uploadUserPhotoToDisk = multer({
//   storage: multerStorageMode('user').disk,
//   fileFilter: multerFilter,
// }).single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  return Object.assign({}, ...allowedFields.map(prop => (obj[prop] ? { [prop]: obj[prop] } : undefined)));
};

exports.createUser = (req, res, next) => {
  res.status(500).json({ status: 'error', message: 'This route is not defined! Please use /signup instead.' });
};

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword instead.', 400));
  }

  // Filtered out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // do NOT update passwords with this
exports.deleteUser = factory.deleteOne(User);
