var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var pg = require('pg');
var ejs = require('ejs');
var read = require('fs').readFileSync;
var join = require('path').join;
var app = express();

var str = read(join(__dirname, '/views/index.ejs'), 'utf8');

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

//Steven : sorry for this poor nested design
app.get('/', function(req, res, next) {
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'cs421g06'", function(err, result) {
    done(err);
    if(err) {
      return console.error('error running query', err);
    }
    var tables = [];
    for(var row in result.rows){
      tables.push(result.rows[row]['table_name']);
    }
    var table_info = {};
    table_info['tables'] = tables;
		
				
		getStatistics("car", function(car_info) {
			var cars = {};
			cars['make'] = car_info.car.make.filter(dup);
			cars['year'] = car_info.car.year.filter(dup);
			table_info['cars'] = cars;
			
			getStatistics("option", function(option_info) {
				var options = {}
				console.log(option_info);
				options['optionid'] = option_info.option.optionid.filter(dup);
				options['optiontype'] = option_info.option.optiontype.filter(dup);
				table_info['options'] = options;

				res.render('index', {table_info: table_info}); 
				pg.end();
			});
		});

    });
  });
});

function dup(elem, index, self) {
	return index == self.indexOf(elem);
}

function handleEmployeeStatistics(table_info, result){
  table_info['employees'] = {};
  var name  = [];
  var employeeId = [];
  var salary = [];
  var branchid = [];  
  var streetaddress = [];
  var city = [];
  var province = [];
  var employedsince = [];
  for(var row in result.rows){
    name.push(result.rows[row]['name']);
  }
  table_info['employees']['name'] = name;

  for(var row in result.rows){
    employeeId.push(result.rows[row]['employeeid']);
  }
  table_info['employees']['employeeid'] = employeeId;

  for(var row in result.rows){
    salary.push(result.rows[row]['salary']);
  }
  table_info['employees']['salary'] = salary;

  for(var row in result.rows){
    branchid.push(result.rows[row]['branchid']);
  }
  table_info['employees']['branchid'] = branchid;

  for(var row in result.rows){
    streetaddress.push(result.rows[row]['streetaddress']);
  }
  table_info['employees']['streetaddress'] = streetaddress;

  for(var row in result.rows){
    city.push(result.rows[row]['city']);
  }
  table_info['employees']['city'] = city;

  for(var row in result.rows){
    province.push(result.rows[row]['province']);
  }
  table_info['employees']['province'] = province;
  for(var row in result.rows){
    employedsince.push(result.rows[row]['employedsince']);
  }
  table_info['employees']['employedsince'] = employedsince;
  return table_info;
}

function handleBranchOfficeStatistics(table_info, result){
  table_info['branchoffice'] = {};
  var branchid  = [];
  var streetaddress = [];
  var city = [];
  var province = [];  

  for(var row in result.rows){
    branchid.push(result.rows[row]['branchid']);
  }
  table_info['branchoffice']['branchid'] = branchid;

  for(var row in result.rows){
    streetaddress.push(result.rows[row]['streetaddress']);
  }
  table_info['branchoffice']['streetaddress'] = streetaddress;

  for(var row in result.rows){
    city.push(result.rows[row]['city']);
  }
  table_info['branchoffice']['city'] = city;

  for(var row in result.rows){
    province.push(result.rows[row]['province']);
  }
  table_info['branchoffice']['province'] = province;

  return table_info;
}

function handleCarStatistics(table_info, result){
  table_info['car'] = {};
	var vin               = []; 
	var	description       = []; 
	var	licenseplate      = []; 
	var	price             = []; 
	var	model             = []; 
	var	color             = []; 
	var	year              = []; 
	var	make              = []; 
	var	fuel              = []; 
	var	mileage           = []; 
	var	acceleration      = []; 
	var	enginetype        = []; 
	var	drivertype        = []; 
	var	branchid          = []; 
	var	businessid        = []; 
	var	manufacturedsince = []; 

  for (var row in result.rows) {
	vin.push(result.rows[row]['vin']);
	}
	table_info['car']['vin'] = vin;

	for (var row in result.rows) {
	description.push(result.rows[row]['description']);
	}
	table_info['car']['description'] = description;

	for (var row in result.rows) {
	licenseplate.push(result.rows[row]['licenseplate']);
	}
	table_info['car']['licenseplate'] = licenseplate;

	for (var row in result.rows) {
	price.push(result.rows[row]['price']);
	}
	table_info['car']['price'] = price;

	for (var row in result.rows) {
	model.push(result.rows[row]['model']);
	}
	table_info['car']['model'] = model;

	for (var row in result.rows) {
	color.push(result.rows[row]['color']);
	}
	table_info['car']['color'] = color;

	for (var row in result.rows) {
	year.push(result.rows[row]['year']);
	}
	table_info['car']['year'] = year;

	for (var row in result.rows) {
	make.push(result.rows[row]['make']);
	}
	table_info['car']['make'] = make;

	for (var row in result.rows) {
	fuel.push(result.rows[row]['fuel']);
	}
	table_info['car']['fuel'] = fuel;

	for (var row in result.rows) {
	mileage.push(result.rows[row]['mileage']);
	}
	table_info['car']['mileage'] = mileage;

	for (var row in result.rows) {
	acceleration.push(result.rows[row]['acceleration']);
	}
	table_info['car']['acceleration'] = acceleration;

	for (var row in result.rows) {
	enginetype.push(result.rows[row]['enginetype']);
	}
	table_info['car']['enginetype'] = enginetype;

	for (var row in result.rows) {
	drivertype.push(result.rows[row]['drivertype']);
	}
	table_info['car']['drivertype'] = drivertype;

	for (var row in result.rows) {
	branchid.push(result.rows[row]['branchid']);
	}
	table_info['car']['branchid'] = branchid;

	for (var row in result.rows) {
	businessid.push(result.rows[row]['businessid']);
	}
	table_info['car']['businessid'] = businessid;

	for (var row in result.rows) {
	manufacturedsince.push(result.rows[row]['manufacturedsince']);
	}
	table_info['car']['manufacturedsince'] = manufacturedsince;

  return table_info;
}

function handleOptionStatistics(table_info, result){
  table_info['option'] = {};
  var optionid   = []; 
	var optiontype = []; 
  var price      = []; 

	for (var row in result.rows) {
		optionid.push(result.rows[row]['optionid']);
	}
	table_info['option']['optionid'] = optionid;

	for (var row in result.rows) {
		optiontype.push(result.rows[row]['optiontype']);
	}
	table_info['option']['optiontype'] = optiontype;

	for (var row in result.rows) {
		price.push(result.rows[row]['price']);
	}
	table_info['option']['price'] = price;

	return table_info;
}

function getStatistics(relation, callback) {
		var table_info = {}
    var sql_query = "SELECT * FROM " + relation;
    pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query(sql_query, function(err, result) {
      done(err);
      if(err) {
        return console.error('error running query', err);
      }
      if (relation == 'employee'){
        table_info = handleEmployeeStatistics(table_info, result);
      } else if (relation == 'branchoffice'){
        table_info = handleBranchOfficeStatistics(table_info, result);
      } else if ( relation == 'car' ) {
				table_info = handleCarStatistics(table_info,result);
			} else if ( relation == "option") {
				table_info = handleOptionStatistics(table_info, result);
			}
			return callback(table_info);
    });
  });	
}

app.post('/', function(req, res){
  var query_type = req.body.query_type;
  var table_info = {};
  if(query_type == "Get Statistics"){
    var selected_option = req.body.selected_table;
		getStatistics(selected_option, function(table_info) {
			res.render(selected_option+'_statistics', {table_info: table_info}); 
		});
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
