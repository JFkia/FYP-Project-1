const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT = 10;

// Helper to create JWT
const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.render("signup", { error: "Email already taken" });

    const passwordHash = await bcrypt.hash(password, SALT);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "user",
    });

    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.render("signup", { error: "Something went wrong" });
  }
};

// Signin Controller
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.render("login", { error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.render("login", { error: "Invalid credentials" });

    const token = createToken(user);

    res.cookie("token", token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.render("login", { error: "Something went wrong" });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect('/login');
};
