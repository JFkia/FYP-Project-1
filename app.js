// app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

// Routers
const contactRouter = require('./routes/contactRouter');
const auditRouter = require('./routes/auditRouter');
const authRouter = require('./routes/authRouter');
const authMiddleware = require('./middleware/authMiddleware');
const CardDelivery = require('./models/CardDelivery');
const deliveryRouter = require('./routes/deliveryRouter');

const exceptionRouter = require('./routes/exceptionRouter');  // <-- NEW ROUTER

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Make user available in EJS
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
app.get("/signup", (req, res) => res.render("signup", { errors: [], formData: {} }));
app.get("/about", (req, res) => res.render("about", { errors: [], formData: {} }));
app.get("/contact", (req, res) => res.render("contact", { errors: [], formData: {} }));
app.get("/profile", (req, res) => res.render("profile"));
// Protected dashboard
app.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const deliveries = await CardDelivery.find().lean();

        const stats = {
            total: deliveries.length,
            delivered: deliveries.filter(d => d.status === 'Delivered').length,
            inTransit: deliveries.filter(d => d.status === 'InTransit').length,
            exceptions: deliveries.filter(d => d.status === 'Failed' || d.status === 'Delayed').length,
        };

        res.render("dashboard", {
            user: req.user,
            deliveries,
            stats,
        });
    } catch (err) {
        console.error(err);
        res.render("dashboard", {
            user: req.user,
            deliveries: [],
            stats: { total: 0, delivered: 0, inTransit: 0, exceptions: 0 },
        });
    }
});

// API routes
app.use("/", authRouter);

// Audit routes
app.use("/", auditRouter);

// Delivery routes
app.use('/deliveries', authMiddleware, deliveryRouter);

// ---------------- Exception Routes ----------------
app.use('/exceptions', authMiddleware, exceptionRouter);

// ---------------- DATABASE + SERVER ----------------
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running on http://localhost:" + (process.env.PORT || 5000));
        });
    })
    .catch((err) => console.error("MongoDB Error:", err));
