const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const app = express();

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'log.txt'),
    { flags: 'a' }
);



let movies = [
    {
        "title": "2001: A Space Odyssey",
        "description": "describe movie",
        "release": "1968",
        "genre": {
            "name": "comedy",
            "description": "placeholder description",
        },
        "director": {
            "name": "placeholder",
            "bio": "placeholder bio",
            "birth year": "1970",
            "death year": "2023",
        },
        "imageUrl": "link to image URL",
        "featured": false
    },
    {
        "title": "The Godfather",
        "description": "describe movie",
        "release": "1972",
        "genre": {
            "name": "thriller",
            "description": "placeholder description",
        },
        "director": {
            "name": "placeholder",
            "bio": "placeholder bio",
            "birth year": "1970",
            "death year": "2023",
        },
        "imageUrl": "link to image URL",
        "featured": false
    },
    {
        "title": "Citizen Kane",
        "description": "describe movie",
        "release": "1941",
        "genre": {
            "name": "comedy",
            "description": "placeholder description",
        },
        "director": {
            "name": "placeholder",
            "bio": "placeholder bio",
            "birth year": "1970",
            "death year": "2023",
        },
        "imageUrl": "link to image URL",
        "featured": false
    },
    {
        "title": "Raiders of the Lost Ark",
        "description": "describe movie",
        "release": "1981",
        "genre": {
            "name": "thriller",
            "description": "placeholder description",
        },
        "director": {
            "name": "placeholder",
            "bio": "placeholder bio",
            "birth year": "1970",
            "death year": "2023",
        },
        "imageUrl": 'link to image URL',
        "featured": 'false'
    },
    {
        "title": "La Dolce Vita",
        "description": "describe movie",
        "release": "1960",
        "genre": {
            "name": "comedy",
            "description": "placeholder description",
        },
        "director": {
            "name": "placeholder",
            "bio": "placeholder bio",
            "birth year": "1970",
            "death year": "2023",
        },
        "imageUrl": "link to image URL",
        "featured": false
    }

];

let users = [];


app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('Welcome to myFlix App!');
})

//Return a list of ALL movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//Return a specific movie
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('No movies found');
    }
});

//Return data about genre by title
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre found');
    }
})

//Return data about director by director's name
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.director.name === directorName).director;

    if (genre) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such director found');
    }
})

//Register a user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('User needs names to register.');
    }
})

//Update the user's information
app.put('/users/:id', (req, res) => {
    res.send('Succesfully updated user information!');
})

//Add user's favorite movie
app.post('/users/:id/:movieTitle', (req, res) => {
    res.send('Added your favotrite movies list!');
})

//Delete a movie form user's favorite movies
app.delete('/users/:id/:movieTitle', (req, res) => {
    res.send('Deleted a movie from the favoutrite movies list');
})

//Deregister the user
app.delete('/users/:id', (req, res) => {
    res.send('Deregisterd');
})



//Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


app.listen(8080, () => {
    console.log('Listening on port 8080');
});