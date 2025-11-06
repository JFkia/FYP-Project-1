// backend/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI; // now includes credentials & db name
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected…'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;
