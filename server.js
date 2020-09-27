const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION 💥 Shutting down...'); // eslint-disable-line no-console
  console.error(err.name, err.message); // eslint-disable-line no-console
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app.js');

const { DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env;
const DB = `${DB_CONNECTION}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

// NOSQL QUERY INJECTION: Use mongoose for MongoDB (because of SchemaTypes)
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!')); // eslint-disable-line no-console
// mongoose.set('returnOriginal', false);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.info(`App running on port ${port}...`); // eslint-disable-line no-console
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION 💥 Shutting down...'); // eslint-disable-line no-console
  console.error(err.name, err.message); // eslint-disable-line no-console
  server.close(() => {
    process.exit(1);
  });
});
