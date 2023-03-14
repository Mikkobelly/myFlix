# myFlix Application (server-side)

## Overview

Live site: [myFlix](https://myflix-by-mikkobelly.herokuapp.com/#)

myFlix will provide users with access to information about different
movies, directors, and genres. Users will be able to sign up, update their
personal information, and create a list of their favorite movies.

## Key features

- GET all movies
- GET a single movie by title
- GET genre data by genre name
- GET director data by director name
- POST new user upon registration if a matching user is not found
- POST user: authenticate user and genarate JWT upon login
- GET current user by username
- PUT user data (update current user data)
- POST movie to user's list of favorites
- DELETE movie from user's list of favorites
- DELETE user permanently (deregister current user)

## Documentation 

For how to use myFlix API: 
[Documentation](https://myflix-by-mikkobelly.herokuapp.com/documentation.html#)

## Technologies
MERN (MongoDB, Express, React, Node.js)

## Dependencies 

    "bcrypt": "^5.1.0",
    "body-parser": "^1.20.1",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-validator": "^6.14.3",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^6.9.0",
    "morgan": "^1.10.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "uuid": "^9.0.0"

## Dev Dependencies

    "eslint": "^8.32.0"

