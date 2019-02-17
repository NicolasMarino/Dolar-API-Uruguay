const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth');

const pool = require('../database'); // connection to db

router.get('/add', isLoggedIn, (req, res) => {
    res.render('posts/add.hbs')
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { title, url, description, contact } = req.body;
    const newLink = {
        title,//req
        url,//req
        description,
        contact, //req
        user_id: req.user.id 
    };
    await pool.query('INSERT INTO posts set ?',[newLink]);
    req.flash('success', 'Post guardado correctamente');
    res.redirect('/posts');
});

router.get('/', isLoggedIn, async (req, res) => {
    const posts = await pool.query('SELECT * FROM posts WHERE user_id = ?', [req.user.id]);
    res.render('posts/list', {posts});
});

router.get('/delete/:id', isLoggedIn, async (req,res) => { 
    const { id } = req.params;
    await pool.query('DELETE FROM posts WHERE ID = ?',[id]);
    req.flash('success', 'Post borrado correctamente');
    res.redirect('/posts');
});

router.get('/edit/:id', isLoggedIn, async (req,res) => { 
    const { id } = req.params;
    const posts = await pool.query('SELECT * FROM posts WHERE ID = ?',[id]);
    res.render('posts/edit', {post: posts[0]});
});

router.post('/edit/:id', isLoggedIn, async (req,res) => { 
    const { id } = req.params;
    const { title, description, url, contact } = req.body;
    const editedPost = {
        title,
        description,
        url,
        contact
    };
    await pool.query('UPDATE posts set ? WHERE id = ?', [editedPost, id]);
    req.flash('success', 'Post editado correctamente');
    res.redirect('/posts');
});


module.exports = router;