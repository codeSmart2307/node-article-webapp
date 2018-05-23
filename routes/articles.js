const express = require('express');
const router = express.Router();

// Load Models
let Article = require('../models/article');

// Add Route
router.get('/', (req, res) => {
    res.render('add_article', {
        title: 'Add Article | Knowledge Base',
        header: 'Add Articles'
    });
});

// Add Submit POST Route
router.post('/', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
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
            author: req.body.author,
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
            res.render('article', {                
                article: article
            });
            return;
        }
    });
});

// Edit article
router.get('/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('edit_article', {
                title: 'Edit Article | Knowledge Base',
                article: article
            });
            return;
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

router .delete('/:id', (req, res) => {
    let query = {_id: req.params.id};

    Article.remove(query, (err) => {
        if (err) {
            console.log(err);
        }
        res.send('Success!');
    });
});

module.exports = router;