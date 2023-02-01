const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + ' ' + password);
    Users.findOne({ Username: username }, (err, user) => {
        if (err) {
            console.log(err);
            return callback(err);
        }

        if (!user) {
            console.log('incorrect username');
            return callback(null, false, { message: 'Incorrect username or password.' });
        }

        if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, { message: 'Incorrect password.' });
        }

        console.log('Finished');
        return callback(null, user);
    });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, (jwtPayLoad, callback) => {
    return Users.findById(jwtPayLoad._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((err) => {
            return callback(err);
        });
}));