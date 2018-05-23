// Import Dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize App
const app = express();

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Connect to Database
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check DB Connection
db.once('open', () => {
    console.log('Connected to MongoDB');  
});

// Check for DB Errors
db.on('error', (err) => {
    console.log(err);
});

// Load Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('index', {
                title: 'Welcome | Knowledge Base',
                header: 'Browse our Articles',
                articles: articles
            });
        }        
    });    
});

// Add Route
app.get('/articles', (req, res) => {
    res.render('add_article', {
        title: 'Add Article | Knowledge Base',
        header: 'Add Articles'
    });
});

// Add Submit POST Route
app.post('/articles', (req, res) => {
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
            res.redirect('/');
        }
    });
});

// Get single article
app.get('/article/:id', (req, res) => {
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
app.get('/article/edit/:id', (req, res) => {
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
app.post('/articles/edit/:id', (req, res) => {
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
            res.redirect('/');
        }
    });
});

app.delete('/article/:id', (req, res) => {
    let query = {_id: req.params.id};

    Article.remove(query, (err) => {
        if (err) {
            console.log(err);
        }
        res.send('Success!');
    });
});

// Start Server
app.listen(3000, () => {
    console.log('Now listening on port 3000');
}) 