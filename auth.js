const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); //Local passport file

let generateJWToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //Username you're encoding in the JWT
        expiresIn: '7d',
        algorithm: 'HS256'
    });
};

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (err) => {
                if (err) {
                    res.send(err);
                }
                let token = generateJWToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}