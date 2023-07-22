'use strict';
const path = require('path');
const cookieParser = require('cookie-parser');
const sanitize = require('sanitize');
const minifyHTML = require("express-minify-html")
const express = require('express');
const session = require('express-session')

const config = require('./config');
const routes = require('./routes');

const app = express();

// set .html as the default extension
app.set('view engine', 'pug');
app.set('views', path.join(
    __dirname,
    './views',
));

app.use(express.static("public"));

if (config.nodeEnv === 'production') {
    app.use(
        minifyHTML({
            override: true,
            exception_url: false,
            htmlMinifier: {
                removeComments: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeEmptyAttributes: true,
                minifyJS: true,
            },
        })
    );
}

app.use(session({ // Sha1 hash.
    secret: '46ed1ca3c67b873bc249bd0e98addd4dbbbcb4bf',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, },
}))
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(sanitize.middleware);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, x-id, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.use('/', routes);

app.get('/', (req, res) => {
    return res.redirect('/dashboard');
});

app.get('/test', (req, res) => {
    res.status(200).send({ message: 'Success', });
});

if (config.nodeEnv === 'production') {
    app.listen(config.appPort);
} else {
    app.listen(config.appPort, () => {
        const url = `http://127.0.0.1:${config.appPort}`;
        console.log(`Listening on ${url}`);
        if (['testing', 'development'].includes(config.nodeEnv)) {
            return;
        }
        const open = require('open');
        open(url);
    });
}
