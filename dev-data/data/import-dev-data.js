const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const { DB_CONNECTION, DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;
const QUERY_STRING_OPTIONS = 'retryWrites=true&w=majority';
const DB = `${DB_CONNECTION}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?${QUERY_STRING_OPTIONS}`;

mongoose
  .connect(DB, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('DB connection successful!')); // eslint-disable-line no-console

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));

// IMPORT DATA INTO DB
// eslint-disable-next-line no-unused-vars
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false }); // NOTE: comment all 'save' middleware before importing data
    await Review.create(reviews);
    console.log('Data successfully loaded!'); // eslint-disable-line no-console
  } catch (err) {
    console.log(err); // eslint-disable-line no-console
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
// eslint-disable-next-line no-unused-vars
const deleteData = async () => {
  try {
    await Review.deleteMany();
    await User.deleteMany();
    await Tour.deleteMany();
    console.log('Data successfully deleted!'); // eslint-disable-line no-console
  } catch (err) {
    console.log(err); // eslint-disable-line no-console
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
