const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load Models
let Article = require('../models/article');
let User = require('../models/user');

//Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login'); 
    }
}

// Add Route
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
        title: 'Add Article | Knowledge Base',
        header: 'Add Articles'
    });
});

// Add Submit POST Route
router.post('/', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: 'Add Article | Knowledge Base',
            errors: errors
        });
    } 
    else {
        let article = new Article({
            title: req.body.title,
            author: req.user._id,
            body: req.body.body
        });
    
        article.save((err) => {
            if (err){
                console.log(err);
            } 
            else {
                req.flash('success', 'Article Added Successfully');
                res.redirect('/');
            }
        });
    }     
});

// Get single article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.log(err);
        }
        else {
            User.findById(article.author, (err, user) => {
                res.render('article', {                
                    article: article,
                    author: user.name
                });
            });           
        }
    });
});

// Edit article
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {        
        if (err) {
            console.log(err);
        }
        else {
            if (article.author != req.user._id) {
                req.flash('danger', 'Not authorized');
                res.redirect('/');
            }
            else {
                res.render('edit_article', {
                    title: 'Edit Article | Knowledge Base',
                    article: article
                });
                return;
            }            
        }        
    });
});

// Update Submit POST Route
router.post('/edit/:id', (req, res) => {
    let article = {
        title: req.body.title,
        author: req.body.author,
        body: req.body.body
    };

    let query = {_id: req.params.id}

    Article.update(query, article, (err) => {
        if (err){
            console.log(err);
        } 
        else {
            req.flash('success', 'Article Updated Successfully');
            res.redirect('/');
        }
    });
});

// Delete Article
router .delete('/:id', (req, res) => {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = {_id: req.params.id};

    Article.findById(req.params.id, (err, article) => {
        if (article.author != req.user._id) {
            res.status(500).send();
        }
        else {
            Article.remove(query, (err) => {
                if (err) {
                    console.log(err);
                }
                res.send('Success!');
            });
        }
    });    
});

module.exports = router;