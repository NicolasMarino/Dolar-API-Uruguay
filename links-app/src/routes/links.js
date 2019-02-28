const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth');

const pool = require('../database'); // connection to db

router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add')
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { title, url, description } = req.body;
    var {is_private} = req.body;
    if(is_private == "on"){
        is_private = true;
    }else{
        is_private = false;
    }
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.id,
        is_private
    };
    await pool.query('INSERT INTO links set ?',[newLink]);
    req.flash('success', 'Link saved succesfully');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
    res.render('links/list', {links});
});

router.get('/delete/:id', isLoggedIn, async (req,res) => { 
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?',[id]);
    req.flash('success', 'Link removed succesfully');
    res.redirect('/links');
});

router.get('/edit/:id', isLoggedIn, async (req,res) => { 
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM links WHERE ID = ?',[id]);
    res.render('links/edit', {link: links[0]});
});

router.post('/edit/:id', isLoggedIn, async (req,res) => { 
    const { id } = req.params;    
    const { title, description, url } = req.body;
    var {is_private} = req.body;
    if(is_private == "on"){
        is_private = true;
    }else{
        is_private = false;
    }
    const newLink = {
        title,
        description,
        url,
        is_private
    };
    console.log(newLink);
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Link updated succesfully');
    res.redirect('/links');
});

router.get('/all', isLoggedIn, async (req,res) => { 
    const links = await pool.query('SELECT title, url, created_at, username, is_private FROM links, users where links.user_id = users.id and links.is_private = 0');
    res.render('links/all-links', {links});
});


module.exports = router;