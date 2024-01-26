const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Error handling middleware
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('Server shutting down');

  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });
// Importing DB url and replacing passowrd saved in .env file
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// Connecting with DB
mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => {
  console.log('DB is running');
});

// Setting up port
const port = process.env.PORT || 8080;

// App listening on this port
const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// Handling rejection middle ware
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Server shutting down');
  server.close(() => {
    process.exit(1);
  });
});
