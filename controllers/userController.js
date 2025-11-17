// controllers/userController.js
const db = require('../db');
const { comparePasswords } = require('../middleware/validation');

// =======================
// View: Login + Register
// =======================

exports.loginForm = (req, res) => {
  res.render('login', {
    messages: req.flash('success'),
    errors: req.flash('error'),
  });
};

exports.registerForm = (req, res) => {
  res.render('register', {
    messages: req.flash('error'),
    formData: req.flash('formData')[0],
  });
};

// =======================
// POST: Register (Sign Up)
// =======================
//
// NOTE: This expects validateRegistration + hashPassword
// to run BEFORE this controller in the route.
//
exports.register = (req, res) => {
  const { userName, userEmail, userRole } = req.body;
  const hashedPassword = req.body.hashedPassword; // from hashPassword middleware

  let userImage;
  if (req.file) {
    userImage = req.file.filename; // Save only the filename
  } else {
    userImage = null;
  }

  // Check if email already exists
  const checkSql = 'SELECT * FROM users WHERE userEmail = ?';
  db.query(checkSql, [userEmail], (checkErr, existing) => {
    if (checkErr) {
      console.error('Database query error (check user):', checkErr.message);
      req.flash('error', 'Something went wrong. Please try again.');
      req.flash('formData', req.body);
      return res.redirect('/register');
    }

    if (existing.length > 0) {
      req.flash('error', 'Email is already registered.');
      req.flash('formData', req.body);
      return res.redirect('/register');
    }

    // Insert new user with BCRYPT hash (no SHA1)
    const insertSql =
      'INSERT INTO users (userName, userEmail, userPassword, userImage, userRole) VALUES (?, ?, ?, ?, ?)';

    db.query(
      insertSql,
      [userName, userEmail, hashedPassword, userImage, userRole],
      (err, result) => {
        if (err) {
          console.error('Database insert error:', err.message);
          req.flash('error', 'Failed to register user. Please try again.');
          req.flash('formData', req.body);
          return res.redirect('/register');
        }

        console.log('User registered:', result.insertId);
        req.flash('success', 'Registration successful! Please log in.');
        return res.redirect('/login');
      }
    );
  });
};

// =======================
// POST: Login (Sign In)
// =======================
//
// NOTE: This expects validateLogin to run BEFORE this controller.
//
exports.login = (req, res) => {
  const { userEmail, userPassword } = req.body;

  const sql = 'SELECT * FROM users WHERE userEmail = ?';
  db.query(sql, [userEmail], async (err, results) => {
    if (err) {
      console.error('Database query error (login):', err.message);
      req.flash('error', 'Something went wrong. Please try again.');
      return res.redirect('/login');
    }

    if (results.length === 0) {
      // No such email
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const user = results[0];

    try {
      const isMatch = await comparePasswords(userPassword, user.userPassword);
      if (!isMatch) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }

      // Successful login
      req.session.user = {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        userRole: user.userRole, // important for auth.js
        userImage: user.userImage,
      };

      req.flash('success', 'Login successful!');

      // Redirect based on role (customise as you like)
      if (user.userRole === 'user') {
        return res.redirect('/cart'); // your previous logic
      } else if (user.userRole === 'admin') {
        return res.redirect('/products');
      } else if (user.userRole === 'courier') {
        return res.redirect('/courier/dashboard'); // adjust to your route
      } else if (user.userRole === 'compliance') {
        return res.redirect('/compliance/dashboard'); // adjust to your route
      } else {
        // fallback
        return res.redirect('/');
      }
    } catch (e) {
      console.error('Password comparison error:', e);
      req.flash('error', 'Something went wrong. Please try again.');
      return res.redirect('/login');
    }
  });
};

// =======================
// Logout
// =======================

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
