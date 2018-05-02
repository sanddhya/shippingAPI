var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

var shippingRoute = require('./api/routes/shipping');
var baseRoute = require('./api/routes/index');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//to enable logs on console
app.use(morgan('dev'));

//CORS handling
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Cache-Control ,Origin,Accept," +
        " X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization,x-access-token");
    next();
});

//redirect request to specific router
app.use('/shipping', shippingRoute);
app.use('/', baseRoute);

//to handle user requested path other that defined api path
app.use('/', function (req, res, next) {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
});

module.exports = app;