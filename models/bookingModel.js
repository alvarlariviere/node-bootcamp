const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();

const hiddenFields = { _id: true, __v: true };

const bookingSchema = new mongoose.Schema(
  {
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// QUERY MIDDLEWARE
bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name' }).populate('user');
  next();
});

bookingSchema.plugin(mongooseHidden, { defaultHidden: hiddenFields });
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
