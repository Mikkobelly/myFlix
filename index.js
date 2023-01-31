const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


//Connect to database
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


const app = express();

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'log.txt'),
    { flags: 'a' }
);


app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//Homepage route
app.get('/', (req, res) => {
    res.send('Welcome to myFlix App!');
})

//Return a list of ALL movies
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => res.status(201).json(movies))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Return a specific movie
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => res.status(201).json(movie))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Return data about genre by title
app.get('/movies/genre/:GenreName', (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.GenreName })
        .then((movie) => res.status(201).json(movie.Genre))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Return data about director by director's name
app.get('/movies/director/:DirectorName', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.DirectorName })
        .then((movie) => res.status(201).json(movie.Director))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Register a user
app.post('/users', (req, res) => {
    const { Username, Password, Email, Birthday } = req.body;
    Users.findOne({ Username: Username })
        .then((user) => {
            if (user) {
                res.status(400).send(`${Username} already exsits.`);
            } else {
                Users.create({
                    Username: Username,
                    Password: Password,
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

//Update the user's information
app.put('/users/:Username', (req, res) => {
    const { Username, Password, Email, Birthday } = req.body;
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set: {
            Username: Username,
            Password: Password,
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

//Add user's favorite movie
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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

//Delete a movie form user's favorite movies
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    const { Username, MovieID } = req.params;
    Users.findOneAndUpdate({ Username: Username }, {
        $pull: { FavoriteMovies: MovieID }
    }, { new: true })
        .then((updatedUser) => res.status(201).json(updatedUser))
        .catch((err) => {
            console.log(err);
            res.status(500).send(`Error: ${err}`);
        });
})

//Deregister the user
app.delete('/users/:Username', (req, res) => {
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



//Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


app.listen(8080, () => {
    console.log('Listening on port 8080');
});