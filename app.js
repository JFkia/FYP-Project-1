// app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRouter');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// -------------------- MIDDLEWARE -------------------- //

// Parse form data & JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Parse cookies (for JWT stored in cookies)
app.use(cookieParser());

// Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// View engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------- ROUTES -------------------- //

// Auth API routes (signup, signin, logout)
app.use('/', authRouter);

// Render signup + login pages
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Protected dashboard (requires valid JWT cookie)
app.get('/dashboard', authMiddleware, (req, res) => {
  // req.user is set in authMiddleware from the decoded token
  res.render('dashboard', { user: req.user });
});

// Simple home route -> redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 404 fallback (optional)
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// -------------------- DATABASE + SERVER -------------------- //

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
