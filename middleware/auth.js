// Middleware to check if user is logged in
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'Please log in to view this resource');
        res.redirect('/login');
    }
};

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.userRole === 'admin') {
        console.log("User has admin rights");
        return next();
    } else {
        console.log("User does NOT have admin rights");
        req.flash('error', 'Access denied');
        res.redirect('/401');
    }
};

// Middleware to check if user is standard user
const checkUser = (req, res, next) => {
    if (req.session.user && req.session.user.userRole === 'user') {
        console.log("User is logged in as user");
        return next();
    } else {
        console.log("This function is for users only.");
        req.flash('error', 'This function is for users only.');
        res.redirect('/401');
    }
};

// Middleware to check if user is courier
const checkCourier = (req, res, next) => {
    if (req.session.user && req.session.user.userRole === 'courier') {
        console.log("User has courier access");
        return next();
    } else {
        console.log("Access denied: courier only");
        req.flash('error', 'Access restricted to courier role.');
        res.redirect('/401');
    }
};

// Middleware to check if user is compliance officer
const checkCompliance = (req, res, next) => {
    if (req.session.user && req.session.user.userRole === 'compliance') {
        console.log("User has compliance access");
        return next();
    } else {
        console.log("Access denied: compliance only");
        req.flash('error', 'Access restricted to compliance role.');
        res.redirect('/401');
    }
};

module.exports = {
    checkAuthenticated,
    checkAdmin,
    checkUser,
    checkCourier,
    checkCompliance
};
