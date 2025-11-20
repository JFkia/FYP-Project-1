// app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

// Routers
const authRouter = require('./routes/authRouter');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Make /public folder available
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Make user available in ALL EJS files
app.use((req, res, next) => {
    res.locals.user = null;
    if (req.cookies.token) {
        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            res.locals.user = decoded;
        } catch (err) {
            res.locals.user = null;
        }
    }
    next();
});

// ---------------- ROUTES ----------------

// Render pages
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("login", { errors: [] }));
app.get("/signup", (req, res) => res.render("signup", { errors: [] }));

// Protected dashboard
app.get("/dashboard", authMiddleware, (req, res) => {
    res.render("dashboard", { user: req.user });
});

// API routes (signup, signin, logout)
app.use("/", authRouter);

// ---------------- DATABASE + SERVER ----------------
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(process.env.PORT || 5000, () => {
            console.log("🚀 Server running on http://localhost:" + (process.env.PORT || 5000));
        });
    })
    .catch((err) => console.error("❌ MongoDB Error:", err));
