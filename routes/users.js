var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'drinksdb'
});

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
	res.render('register', { errors: [] }
	);
});

router.get('/login', function (req, res, next) {
	res.render('login', { errors: [] }
	);
});

router.post('/register', function (req, res, next) {
	// get form values
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var username = req.body.username;
	var password = req.body.password;
	var confirmpassword = req.body.confirmpassword;

	// form validation
	req.checkBody('username', 'Username is required.').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('confirmpassword', 'Passwords do not match.').equals(req.body.password);

	// check for errors
	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors,
			firstname: firstname,
			lastname: lastname,
			username: username,
			password: password,
			confirmpassword: confirmpassword
		});
	} else {
		//console.log(name);
		//console.log(password);
		connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "'", function (err, rows) {
			if (err) throw err;
			if (rows.length) {
				console.log('This username already exists.');
				req.flash('success', 'This username is already taken.');
				res.location('/users/register');
				res.redirect('/users/register');
			}
			else {
				// encryption
				bcrypt.hash(password, 10, function (err, hash) {
					if (err) throw err;
					var user = {
						firstname: firstname,
						lastname: lastname,
						username: username,
						password: hash
					};
					connection.query('INSERT INTO users SET ?', user, function (err, result) {
						// user inserted
						req.flash('success', 'User registered, you may log in now.');
						res.location('/users/login');
						res.redirect('/users/login');
						if (err) {
							console.log(err);
						}
					});
				});
			}
		});
	}

});

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
	connection.query("select * from users where id = " + id, function (err, rows) {
		done(err, rows[0]);
	});
});

passport.use(new LocalStrategy(
	function (username, password, done) {
		connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "'", function (err, rows) {
			if (err)
				return done(err);
			if (!rows.length) {
				console.log('No user found');
				return done(null, false);
			}

			// if the user is found but the password is wrong
			bcrypt.compare(password, rows[0].password, function (err, res) {
				if (!res) {
					console.log('Wrong password');
					return done(null, false);
				}
				else {
					// all is well, return successful user
					return done(null, rows[0]);
				}
			});



		});
	}
));

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password.' }), function (req, res) {
	console.log('Login successful');
	req.flash('success', 'You are logged in');
	res.redirect('/');
});

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('/users/login');
});


module.exports = router;
