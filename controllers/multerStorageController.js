const multer = require('multer');
const AppError = require('../utils/appError');

exports.multerStorageMode = modelName => {
  return {
    memory: multer.memoryStorage(),
    disk: multer.diskStorage({
      destination: (req, file, cb) => cb(null, `public/img/${modelName}`),
      filename: (req, file, cb) => cb(null, `${modelName}-${req[modelName].id}-${Date.now()}.${file.mimetype.split('/')[1]}`),
    }),
  };
};

exports.multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
