const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');

const app = express();

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'log.txt'),
    { flags: 'a' }
);

let movies = [

    {
        title: 'Harry Potter',
        year: 2001
    },
    {
        title: 'Lord of the Rings',
        year: 2002
    },
    {
        title: 'Twilight',
        year: 2009
    },
    {
        title: 'Notting Hill',
        year: 1999
    },
    {
        title: 'God Father',
        year: 1972
    },
    {
        title: '2000',
        year: 2009
    },
    {
        title: 'Forrest Gump',
        year: 1995
    },
    {
        title: 'Danish Girl',
        year: 2016
    },
    {
        title: 'Bohemian Rhapsody',
        year: 2018
    },
    {
        title: 'Titanic',
        year: 1997
    }

];


app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.send('Welcome to myFlix App!')
});

app.get('/movies', (req, res) => {
    res.json(movies);
});


//Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


app.listen(8080, () => {
    console.log('Listening on port 8080');
});