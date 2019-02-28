
const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth');

const pool = require('../database'); // connection to db


router.get('/', isLoggedIn, async (req, res) => {
    console.log('tamo aca');
    console.log('tamo aca');
    const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
    res.render('profile/main-profile', {links});
});


module.exports = router;