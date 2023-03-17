const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');
const { check, validationResult } = require('express-validator');

// Require models defined in models.js
const Movies = Models.Movie;
const Users = Models.User;


// Connect to database
// mongoose.set('strictQuery', false);
// mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log('MongoDB connected'))
//     .catch(err => console.error(err));

mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


const app = express();

// Append Morgan logs to log.txt
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'log.txt'),
    { flags: 'a' }
);

// Set up the logger
app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Note: These lines have to be written right before "let auth = require(./auth)(app);"
const cors = require('cors');
app.use(cors());


// Note: These lines have to be written after bodyParser middeleware function
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


/**
* GET index.html file
*/
app.get('/', (req, res) => {
    res.send('Welcome to myFlix App!');
});

/**
* GET all movies
* @name getMovies
* @kind function
* @requires passport
* @returns array of movie objects
*/
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => res.status(201).json(movies))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
* GET a single movie by title
* @name getMovie
* @kind function
* @param {string} title of the movie
* @requires passport
* @returns a movie object matching specified title
*/
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => res.status(201).json(movie))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
* GET genre data by genre name
* @name getGenre
* @kind function
* @param {string} genre name
* @requires passport
* @returns a movie object with specified genre name
*/
app.get('/movies/genre/:GenreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.GenreName })
        .then((movie) => res.status(201).json(movie.Genre))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
* GET director data by director name
* @name getDirector
* @kind function
* @param {string} director name
* @requires passport
* @returns a movie object with specified director name
*/
app.get('/movies/director/:DirectorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.DirectorName })
        .then((movie) => res.status(201).json(movie.Director))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
* POST new user upon registration if a matching user is not found
* Perform checks on Username, Password and Email fields and
* Hash the password
* @name registerUser
* @kind function
* @returns newly created user object
*/
app.post('/users',
    // Validating inputs
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {

        // Check validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        const { Username, Email, Birthday } = req.body;

        // Search to see if a user with the requested username already exists
        Users.findOne({ Username: Username })
            .then((user) => {
                if (user) {
                    res.status(400).send(`${Username} already exsits.`);
                } else {
                    // Create new user if existing not found
                    Users.create({
                        Username: Username,
                        Password: hashedPassword,
                        Email: Email,
                        Birthday: Birthday
                    }).then((createdUser) => res.status(201).json(createdUser))
                        .catch((err) => {
                            console.log(err);
                            res.status(500).send(`Error: ${err}`);
                        });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(`Error: ${err}`);
            });
    });

/**
* GET current user by username
* @name getUser
* @kind function
* @param {string} username
* @requires passport
* @returns a user object
*/
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => res.status(201).json(user))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
})

/**
* PUT user data (update current user data)
* Perform checks on Username, Password and Email fields and
* Hash the password
* @name updateUser
* @kind function
* @param {string} username
* @requires passport
* @returns updated user object
*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {

        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        const { Username, Email, Birthday } = req.body;

        // Find matching user and update
        Users.findOneAndUpdate({ Username: req.params.Username }, {
            $set: {
                Username: Username,
                Password: hashedPassword,
                Email: Email,
                Birthday: Birthday
            }
        }, { new: true })
            .then((updatedUser) => res.status(201).json(updatedUser))
            .catch((err) => {
                console.log(err);
                res.status(500).send(`Error: ${err}`);
            });
    });

/**
* POST movie to user's list of favorites
* @name addFavMovie
* @kind function
* @param {string} username
* @param {string} movie ID
* @requires passport
* @returns updated user object with newly added movie to user's list of favorites
*/
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { Username, MovieID } = req.params;
    Users.findOneAndUpdate({ Username: Username }, {
        $push: { FavoriteMovies: MovieID }
    }, { new: true })
        .then((updatedUser) => res.status(201).json(updatedUser))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
* DELETE movie from user's list of favorites
* @name deleteFavMovie
* @kind function
* @param {string} username
* @param {string} movie ID
* @requires passport
* @returns updated user object after the movie is deleted from user's list of favorites
*/
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { Username, MovieID } = req.params;
    Users.findOneAndUpdate({ Username: Username }, {
        $pull: { FavoriteMovies: MovieID }
    }, { new: true })
        .then((updatedUser) => res.status(201).json(updatedUser))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
* DELETE user permanently (deregister current user)
* @name deleteUser
* @kind function
* @param {string} username
* @requires passport
* @returns a message after deletion
*/
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { Username } = req.params;
    Users.findOneAndRemove({ Username: Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(`${Username} is not found.`);
            } else {
                res.status(200).send(`${Username} is deregistered.`)
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for requents
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`);
});