var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
const pg = require('pg');

var app = express();

// connect to database
var config = {
  user: 'cs421g06', //env var: PGUSER 
  database: 'cs421', //env var: PGDATABASE 
  password: 'tisu612#', //env var: PGPASSWORD 
  host: 'comp421.cs.mcgill.ca', // Server hosting the postgres database 
  port: 5432, //env var: PGPORT 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};

var pool = new pg.Pool(config);

// pool.connect(function(err, client, done) {
//   if(err) {
//     return console.error('error fetching client from pool', err);
//   }

// client.query('SELECT * FROM car', function(err, result) {
//     done(err);
 
//     if(err) {
//       return console.error('error running query', err);
//     }
//     console.log(result.rows);
//   });

// });

// view engine html setup
var engine = require('consolidate');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engine.mustache);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
app.use('/users', users);

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.post('/', function(req, res){
  var firstName = req.body.firstName;
  pool.query('SELECT * FROM car', function(err, result) {
    console.log("HELLOOOOO");
    done(err);
 
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
  });
  res.render('index');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;
