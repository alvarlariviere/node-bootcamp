const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// CROSS-SITE SCRIPTING (XSS) ATTACKS: Set special HTTP headers (helment package)
// Set security HTTP headers:
/**
  Content-Security-Policy          : to help prevent XSS attacks and other cross-site injections.
  X-DNS-Prefetch-Control           : to control browser DNS prefetching.
  Expect-CT                        : for handling Certificate Transparency.
  X-Frame-Options                  : to prevent ClickJacking.
  X-Powered-By                     : to remove X-Powered-By header. This header leaks the version of the server and its vendor.
  Strict-Transport-Security        : for HTTP Strict Transport Security.
  X-Download-Options               : to restrict download options for IE8+.
  X-Content-Type-Options           : to prevent MIME-type Sniffing attacks.
  X-Permitted-Cross-Domain-Policies: to prevent Adobe Flash or Adobe Acrobat from loading data.
  Referrer-Policy                  : to hide the Referer header.
  X-XSS-Protection                 : to add protection to XSS attacks.
*/
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [`'none'`],
      connectSrc: [
        `'self'`,
        'ws:' /* parcel */,
        'https://*.tiles.mapbox.com' /* mapbox */,
        'https://api.mapbox.com' /* mapbox */,
        'https://events.mapbox.com' /* mapbox */,
      ],
      // connectSrc: [
      //   `'self'`,
      //   'https://core-portal.bankingofthings.io',
      //   'https://core-portal-dev.bankingofthings.io',
      //   'https://web-api.bankingofthings.io',
      //   'https://web-api-dev.bankingofthings.io',
      //   'https://www.google-analytics.com;',
      // ],
      scriptSrc: [
        `'self'`,
        'https://api.mapbox.com' /* mapbox */,
        'https://cdnjs.cloudflare.com' /* mapbox */,
        'https://js.stripe.com/v3/' /* stripe */,
      ],
      // scriptSrc: [`'self'`, 'https://ssl.google-analytics.com', 'www.google-analytics.com'],
      imgSrc: [`'self'`, 'data:' /* mapbox */, 'blob:' /* mapbox */],
      // imgSrc: [
      //   `'self'`,
      //   `data:`,
      //   'www.google-analytics.com',
      //   'https://cdn.bankingofthings.io',
      //   'https://web-api.bankingofthings.io',
      //   'https://web-api-dev.bankingofthings.io;',
      // ],
      styleSrc: [
        `'self'`,
        `'unsafe-inline'` /* mapbox */,
        'https://api.mapbox.com' /* mapbox */,
        'https://fonts.googleapis.com' /* mapbox */,
        'https://fonts.gstatic.com' /* mapbox */,
      ],
      // styleSrc: [`'self'`, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.bankingofthings.io'],
      fontSrc: [`'self'`, 'https://fonts.gstatic.com' /* mapbox */],
      // fontSrc: [`'self'`, 'https://fonts.gstatic.com', 'https://cdn.bankingofthings.io'],
      frameSrc: [`'self'`, 'https://js.stripe.com/v3/' /* stripe */],
      // frameSrc: ['https://www.youtube.com'],
      workerSrc: [`'self'`, 'blob:' /* mapbox */],
      childSrc: [`'self'`, 'blob:' /* mapbox */],
    },
  })
);

// Develpment logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// BRUTE FORCE & DENIAL-OF-SERVICE (DOS) ATTACKS: Implement rate limiting (express-rate-limit)
// Limit requests from same API
app.use(
  '/api',
  rateLimit({
    max: 100, // 100 request from the same IP...
    windowMs: 60 * 60 * 1000, // ...in 1 hour
    message: 'Too many requests from this IP, please try again in an hour!',
  })
);

// DENIAL-OF-SERVICE (DOS) ATTACKS: Limit body payload (in body-parser)
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // url-encoded forms (<form action='/view-route' method='POST' ></form>)
// Cookie parser
app.use(cookieParser());

// CROSS-SITE SCRIPTING (XSS) ATTACKS & NOSQL QUERY INJECTION: Sanitize user input data (express-mongo-sanitize & xss-clean)
// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // filters out all dollar signs and dots from req.body, req.queryString, req.params
// Data sanitization against XSS
app.use(xss()); // cleans any user input from malicious HTML code

// OTHER BEST PRACTICES: Prevent parameter pollution causing Uncaught Exceptions
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 2) ROUTES
// Views
app.use('/', viewRouter);
// API
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// API path not found middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
