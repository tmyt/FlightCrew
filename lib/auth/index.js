'use strict';

const SupportedStrategies = [ 'windowslive' ];

const express = require('express')
    , passport = require('passport')
    , router = express.Router();

const WindowsLiveStrategy = require('passport-windowslive').Strategy;

router.get('/', passport.authenticate('windowslive', {scope: ['wl.basic', 'wl.emails'], display: 'page'}));
router.get('/callback', passport.authenticate('windowslive', {failureRedirect: '/auth/failed'}),
  function(req, res){ res.redirect('/'); });
router.get('/failed', (req, res) => {
  res.render('auth/failed');
});

router.install = function(passport){
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    passport.use(new WindowsLiveStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URI
    }, function(accessToken, refreshToken, profile, done){
        process.nextTick(function(){
            return done(null, {
              account: profile._json.emails.account
            });
        });
    }));
}

module.exports = router;

