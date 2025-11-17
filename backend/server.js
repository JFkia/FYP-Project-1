// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRouter = require('./routes/authRouter');   // ✅ match the file name
const authenticate = require('./middleware/authMiddleware');

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const app = express();

    // middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());                         // ✅ moved here, after app is created

    // EJS setup
    app.set('views', path.join(__dirname, '../frontend/views'));
    app.set('view engine', 'ejs');

    // static files
    app.use(express.static(path.join(__dirname, '../frontend/public')));

    // page routes
    app.get('/login', (req, res) => res.render('login', { error: null }));
    app.get('/signup', (req, res) => res.render('signup', { error: null }));

    // auth API routes
    app.use('/api/auth', authRouter);

    // protected page
    app.get('/dashboard', authenticate, (req, res) => {
      res.render('dashboard', { user: req.user });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server failed:", err);
  }
}

start();
