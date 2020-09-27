const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // RENDERED WEBSITE
  console.error('ERROR 💥', err); // eslint-disable-line no-console

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// OTHER BEST PRACTICES: Don't send error details to clients
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programminig or other unknown error: don't leak error details
    // Log error
    console.error('ERROR 💥', err); // eslint-disable-line no-console

    // Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // RENDERED WEBSITE
  // Operational, trusted
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // Programminig or other unknown error: don't leak error details
  // Log error
  console.error('ERROR 💥', err); // eslint-disable-line no-console

  // Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

const handleDefaultErrorDB = err => err;
const handleCastErrorDB = err => {
  const message = `Invalid "${err.path}": "${err.value}".`;
  return new AppError(message, 400);
};
const handleMongoErrorDB = err => {
  let appError;
  // duplicate key
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    const message = `Duplicate field value ${value}. Please use another value!`;
    appError = new AppError(message, 400);
  } else {
    const message = `Generic database error. Please check your payload data!`;
    appError = new AppError(message, 400);
  }

  return appError;
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJsonWebTokenErrorDB = () => new AppError('Invalid token. Please log in again!', 401);
const handleTokenExpiredErrorDB = () => new AppError('Your token has expired. Please log in again!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    const errors = {
      DefaultError: handleDefaultErrorDB,
      CastError: handleCastErrorDB,
      MongoError: handleMongoErrorDB,
      ValidationError: handleValidationErrorDB,
      JsonWebTokenError: handleJsonWebTokenErrorDB,
      TokenExpiredError: handleTokenExpiredErrorDB,
    };
    const errorName = err.name && errors[err.name] ? err.name : 'DefaultError';
    const error = errors[errorName](err);

    // if (err.name === 'CastError') error = handleCastErrorDB(err);
    // if (err.name === 'MongoError' && err.code === 11000) error = handleMongoErrorDB(err);
    // if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    // if (err.name === 'JsonWebTokenError') error = handleJsonWebTokenErrorDB(err);

    sendErrorProd(error, req, res);
  }
};
