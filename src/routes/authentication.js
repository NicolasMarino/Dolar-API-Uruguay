const express = require('express');
const router = express.Router();

const passport = require('passport');
const {isLoggedIn,isLoggedAlready} = require('../lib/auth');
const pool = require('../database'); // connection to db

router.get('/signup', isLoggedAlready, (req,res) => {
    res.render('auth/signup');
});

router.post('/signup', isLoggedAlready, passport.authenticate('local.signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
}));

router.get('/signin', isLoggedAlready, (req,res) => {
    res.render('auth/signin');
});

router.post('/signin', isLoggedAlready, (req, res, next) => {
    passport.authenticate('local.signin',{
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
});

router.get('/profile', isLoggedIn, async(req,res) => {
    const links = await pool.query('SELECT title, url, created_at, username FROM links, users');
    res.render('profile', {links});
});

router.get('/logout', isLoggedIn, (req,res) => {
    req.logout();
    res.redirect('/signin');
});

module.exports = router;