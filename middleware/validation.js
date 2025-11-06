// validation.js
const bcrypt = require('bcrypt');

const ALLOWED_ROLES = ['admin', 'user', 'courier', 'compliance'];

// salt is a random string added to password before hashing
// rounds is the amount of times the hashing algorithm is applied
const SALT_ROUNDS = 10;

// checking for valid email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Middleware: validate registration fields
const validateRegistration = (req, res, next) => {
  const { userName, userEmail, userPassword, userRole } = req.body;

  if (!userName || !userEmail || !userPassword || !userRole) {
    req.flash('error', 'All fields are required.');
    req.flash('formData', req.body);
    return res.redirect('/register');
  }

  if (!emailRegex.test(String(userEmail).trim())) {
    req.flash('error', 'Please enter a valid email address.');
    req.flash('formData', req.body);
    return res.redirect('/register');
  }

  if (!ALLOWED_ROLES.includes(userRole)) {
    req.flash('error', 'Invalid role selected.');
    req.flash('formData', req.body);
    return res.redirect('/register');
  }

  if (String(userPassword).length < 6) {
    req.flash('error', 'Password should be at least 6 characters long.');
    req.flash('formData', req.body);
    return res.redirect('/register');
  }

  // Normalize a couple of fields (optional but handy)
  req.body.userEmail = String(userEmail).trim().toLowerCase();
  req.body.userName = String(userName).trim();

  next();
};

// Middleware: hash password for registration
const hashPassword = async (req, res, next) => {
  try {
    const { userPassword } = req.body;
    if (!userPassword) {
      req.flash('error', 'Password is required.');
      req.flash('formData', req.body);
      return res.redirect('/register');
    }

    const hashed = await bcrypt.hash(userPassword, SALT_ROUNDS);

    // Attach hashed password and remove plaintext
    req.body.hashedPassword = hashed;
    delete req.body.userPassword;

    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/register');
  }
};

// Middleware: validate login fields
const validateLogin = (req, res, next) => {
  const { userEmail, userPassword } = req.body;

  if (!userEmail || !userPassword) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/login');
  }

  req.body.userEmail = String(userEmail).trim().toLowerCase();
  next();
};

// Helper: compare plaintext vs hashed password (use in login route)
const comparePasswords = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

module.exports = {
  validateRegistration,
  hashPassword,
  validateLogin,
  comparePasswords,
};
