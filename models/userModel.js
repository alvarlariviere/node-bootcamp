const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const mongooseHidden = require('mongoose-hidden')();
const bcrypt = require('bcryptjs');

const hiddenFields = { _id: true, __v: true };

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Incorrect email'],
    },
    photo: { type: String, default: 'default.jpg' },
    role: { type: String, enum: ['user', 'guide', 'lead-guide', 'admin'], default: 'user' },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters '],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Password confirmation is required'],
      minlength: [8, 'Password confirmation must be at least 8 characters '],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: `Passwords are not the same`,
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: { type: Boolean, default: true, select: false },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// DOCUMENTS MIDDLEWARE: runs before .save() and .create()
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  // COMPROMISED DATABASE: Strongly encrypt passwords with salt and hash (bcrypt)
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

// Update changedPasswordAt property every time password changes
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); // filter only actives
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  // BRUTE FORCE ATTACKS: Use bcrypt (to make login request slow)
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); // to milliseconds
    return JwtTimestamp < changedTimestamp;
  }

  // NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // COMPROMISED DATABASE: Strongly encrypt passwords reset tokens (SHA 256)
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // OTHER BEST PRACTICES: Create random password reset tokens with expirty dates
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.plugin(mongooseHidden, { defaultHidden: hiddenFields });
const User = mongoose.model('User', userSchema);

module.exports = User;
