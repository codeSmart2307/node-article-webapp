// Import Dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash'); 
const passport = require('passport');
const config = require('./config/database');

// Initialize App
const app = express();

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Express Session Middleware
app.use(session({
    secret: 'light mouse',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }; 
    }
}));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Connect to Database
mongoose.connect(config.database);
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

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start Server
app.listen(3000, () => {
    console.log('Now listening on port 3000');
}); 