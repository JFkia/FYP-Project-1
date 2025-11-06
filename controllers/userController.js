const db = require('../db');


exports.getUser = (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE userId = ?';
    // Fetch data from MySQL
    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving users');
        }

        if (results.length > 0) {
            console.log('All users:', results);
            res.render('viewUser', { userProfile: results[0] });
        } else {
            // If no user with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No Users');
        }
    });
};



exports.getUsers = (req, res) => {
    const sql = 'SELECT * FROM users';
    // Fetch data from MySQL
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving users');
        }

        if (results.length > 0) {
            console.log('All users:', results[0].userName);
            res.render('viewAllUsers', { users: results });
        } else {
            // If no user with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No Users');
        }
    });
};


exports.loginForm = (req, res) => {
    res.render('login', { messages: req.flash('success'), errors: req.flash('error') });
};

exports.login = (req, res) => {
    const { userEmail, userPassword } = req.body;

    const sql = 'SELECT * FROM users WHERE userEmail = ? AND userPassword = SHA1(?)';
    db.query(sql, [userEmail, userPassword], (err, results) => {
        if (err) {
            throw err;
        }

        if (results.length > 0) {
            // Successful login
            req.session.user = results[0];
            req.flash('success', 'Login successful!');
            if (req.session.user.role == 'user')
                // res.redirect('/shopping');
                res.redirect('/cart');
            else
                res.redirect('/products');
        } else {
            // Invalid credentials
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    });
};


exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

exports.registerForm = (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
};

exports.register = (req, res) => {
    const { userName, userEmail, userPassword, userRole } = req.body;

    let userImage;
    if (req.file) {
        userImage = req.file.filename; // Save only the filename
    } else {
        userImage = null;
    }


    const sql = 'INSERT INTO users (userName, userEmail, userPassword, userImage, userRole) VALUES (?, ?, SHA1(?), ?, ?)';
    db.query(sql, [userName, userEmail, userPassword, userImage, userRole], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
};


exports.editUserForm = (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE userId = ?';

    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving user by ID');
        }

        // Check if any user with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the user data
            res.render('editUser', { user: results[0] });
        } else {
            // If no user with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('User not found');
        }
    });


};


exports.editUser = (req, res) => {
    const userId = req.params.id;
    const { userName, userRole } = req.body;

    let userImage = req.body.currentImage; //retrieve current image filename
    if (req.file) {
        userImage = req.file.filename; // Save only the filename
    }


    const sql = 'UPDATE users set username = ?, userImage = ?, userRole = ? WHERE userId = ?';
    db.query(sql, [userName, userImage, userRole, userId], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        //   req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/users');
    });
};

//delete user
exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE userId = ?';
    db.query(sql, [userId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting user:", error);
            res.status(500).send('Error deleting user');
        } else {
            // Send a success response
            res.redirect('/users');
        }
    });
}



//Myself

exports.getMyself = (req, res) => {
    const userId = req.session.user.userId;
    console.log("userId" + userId)
    const sql = 'SELECT * FROM users WHERE userId = ?';
    // Fetch data from MySQL
    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving users');
        }

        if (results.length > 0) {
            console.log('All users:', results);
            res.render('viewMyself', { userProfile: results[0] });
        } else {
            // If no user with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No Users');
        }
    });
};


exports.editMyselfForm = (req, res) => {
    const userId = req.session.user.userId;
    const sql = 'SELECT * FROM users WHERE userId = ?';

    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving user by ID');
        }

        // Check if any user with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the user data
            res.render('editMyself', { user: results[0] });
        } else {
            // If no user with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('User not found');
        }
    });


};


exports.editMyself = (req, res) => {
    const userId = req.session.user.userId;
    const { userName, userRole } = req.body;

    let userImage = req.body.currentImage; //retrieve current image filename
    if (req.file) {
        userImage = req.file.filename; // Save only the filename
    }


    const sql = 'UPDATE users set username = ?, userImage = ? WHERE userId = ?';
    db.query(sql, [userName, userImage, userId], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        //   req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/myself');
    });
};