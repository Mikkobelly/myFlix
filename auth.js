const jwtSecret = 'your_jwt_secret'; // Should be the same key used in the JWTStrategy
const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); //Local passport file

/** 
 * Generate user's JWT (JSON Web Token)
 * @name generateJWT
 * @kind function
 * @param {*} user
 * @returns user object and JWT for the user
 **/
let generateJWToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //Username you're encoding in the JWT
        expiresIn: '7d',
        algorithm: 'HS256'
    });
};

/** 
 * POST user: authenticate user and genarate JWT upon login
 * @name loginUser
 * @kind function
 * @param {*} router
 * @requires passport
 * @returns user object and JWT for the user
 **/
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