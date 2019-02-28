
const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth');

const pool = require('../database'); // connection to db


router.get('/', isLoggedIn, async (req, res) => {   
    const links = await pool.query('SELECT links.id, title, url, created_at, username, is_private FROM links, users WHERE links.user_id = ? AND users.id = ?', [req.user.id,req.user.id]);
    res.render('profile/main-profile', {links});
});


module.exports = router;

