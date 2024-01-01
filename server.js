const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');
const { Schema } = mongoose;
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false);
mongoose.connect(DB).then((connection) => {
  console.log('DB is running');
});



// PORT
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
