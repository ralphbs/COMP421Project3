var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var pg = require('pg');
require('query');
var app = express();

// connect to database
var config = {
  user: 'cs421g06', //env var: PGUSER 
  database: 'cs421', //env var: PGDATABASE 
  password: 'tisu612#', //env var: PGPASSWORD 
  host: 'comp421.cs.mcgill.ca', // Server hosting the postgres database 
  port: 5432, //env var: PGPORT 
  max: 10, 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};


var pool = new pg.Pool(config);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// use routes
//app.use('/', index);
//app.use('/users', users);

app.get('/', function(req, res, next) {
  res.render('index', {arr: []});
});

app.post('/', function(req, res){
  var info = req.body.query_type;
  if(info == "Get_Stats"){
      pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'cs421g06'", function(err, result) {
      done(err);
      if(err) {
        return console.error('error running query', err);
      }
      var arr = [];
      for(var x in result.rows){
        arr.push(result.rows[x]['table_name']);
      }
      console.log(arr);
    });
  });
  res.render('index', {arr: arr}); 
  }
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
