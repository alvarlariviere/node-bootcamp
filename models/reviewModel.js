const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();
const Tour = require('./tourModel');

const hiddenFields = { _id: true, __v: true };

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review is required'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal to 1.0'],
      max: [5, 'Rating must be below or equal to 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour is required.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User is required.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

// Calculate and update tour's ratingsQuantity and ratingsAverage...
// ...for creation
reviewSchema.statics.calcAverageRatings = async function (tour) {
  const stats = await this.aggregate([
    { $match: { tour: tour } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tour, {
    ratingsQuantity: stats.length > 0 ? stats[0].nRating : 0,
    ratingsAverage: stats.length > 0 ? stats[0].avgRating : 4.5,
  });
};
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});
// ...for update and deletion
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewTemp = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // this.reviewTemp = await this.findOne(); doesn't NOT work here, query has already executed
  await this.reviewTemp.constructor.calcAverageRatings(this.reviewTemp.tour);
});

reviewSchema.plugin(mongooseHidden, { defaultHidden: hiddenFields });
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
