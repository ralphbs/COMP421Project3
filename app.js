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
var table_infos = {};  //this will hold globally the tables because we have to refresh page with new data including the old ones.
table_infos['special_cars'] = [];

table_infos['errors_bo'] = [];
table_infos['errors_e'] = [];
table_infos['success_insert'] = [];

table_infos['errors_amt'] = [];
table_infos['success_update'] = [];

table_infos['errors_date'] = [];

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

app.get('/', function(req, res, next) {
	refresh(req,res,next);
});

//Steven : sorry for this poor nested design
function refresh(req, res, next) {
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
		
		//removing uselss tables
		var index = tables.indexOf("mechanic");
		tables.splice(index, 1);
		index = tables.indexOf("manager");
		tables.splice(index, 1);
		index = tables.indexOf("salesman");
		tables.splice(index, 1);
		index = tables.indexOf("maintenance");
		tables.splice(index, 1);

		//initalize all the variables to be shown in the index page

    table_infos['tables'] = tables;
				
		getStatistics("car","", function(car_info) {
			var cars = {};
			cars['make'] = car_info.car.make.filter(dup);
			cars['year'] = car_info.car.year.filter(dup);
			table_infos['cars'] = cars;
			
			getStatistics("option","", function(option_info) {
				var options = {}
				options['optionid'] = option_info.option.optionid.filter(dup);
				options['optiontype'] = option_info.option.optiontype.filter(dup);
				table_infos['options'] = options;

				getStatistics("mechanics","", function(mechanics_info){
					var mechanics = {}
					mechanics['employeeid'] = mechanics_info.mechanics.employeeid.filter(dup);
					mechanics['employeename'] = mechanics_info.mechanics.employeename.filter(dup);
					table_infos['mechanics'] = mechanics;

					getStatistics("employee","", function(employee_info) {
						var employees = {}
						employees['employeeid'] = employee_info.employees.employeeid;
						employees['name'] = employee_info.employees.name;	
						table_infos['employees'] = employees;

						res.render('index', {table_info: table_infos}); 
						pg.end();
					});
				});
			});
		});

    });
  });
}

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

function handleMechanicStatistics(table_info, result){
  table_info['mechanics'] = {};
		var employeeid   = []; 
		var employeename = []; 
		var branch       = []; 
		var salary       = []; 

		for (var row in result.rows) {
			employeeid.push(result.rows[row]['employeeid']);
		}
		table_info['mechanics']['employeeid'] = employeeid;

		for (var row in result.rows) {
			employeename.push(result.rows[row]['employeename']);
		}
		table_info['mechanics']['employeename'] = employeename;

		for (var row in result.rows) {
			branch.push(result.rows[row]['branch']);
		}
		table_info['mechanics']['branch'] = branch;

		for (var row in result.rows) {
			salary.push(result.rows[row]['salary']);
		}
		table_info['mechanics']['salary'] = salary;

		return table_info;
}

function handleMaintenancesStatistics(table_info, result) {
	table_info['maintenances'] = {};

	var maintenanceid = [];
	var maintenancetype = [];
	var maintenancedate = [];
	var vin = [];
	var employeeid = [];

	for (var row in result.rows) {
		maintenanceid.push(result.rows[row]['maintenanceid']);
	}
	table_info['maintenances']['maintenanceid'] = maintenanceid;

	for (var row in result.rows) {
		maintenancetype.push(result.rows[row]['maintenancetype']);
	}
	table_info['maintenances']['maintenancetype'] = maintenancetype;

	for (var row in result.rows) {
		maintenancedate.push(result.rows[row]['maintenancedate']);
	}
	table_info['maintenances']['maintenancedate'] = maintenancedate;

	for (var row in result.rows) {
		vin.push(result.rows[row]['vin']);
	}
	table_info['maintenances']['vin'] = vin;

	for (var row in result.rows) {
		employeeid.push(result.rows[row]['employeeid']);
	}
	table_info['maintenances']['employeeid'] = employeeid;

	return table_info;
}
function handleContractsStatistics(table_info, result) {
	table_info['contracts'] = {};

	var contractid = [];
	var dateofinitiation = [];
	var content = [];
	var price = [];
	var employeeid = [];
	var driverslicense = [];
	var vin = [];

	for (var row in result.rows) {
		contractid.push(result.rows[row]['contractid']);
	}
	table_info['contracts']['contractid'] = contractid;

	for (var row in result.rows) {
		dateofinitiation.push(result.rows[row]['dateofinitiation']);
	}
	table_info['contracts']['dateofinitiation'] = dateofinitiation;

	for (var row in result.rows) {
		content.push(result.rows[row]['content']);
	}
	table_info['contracts']['content'] = content;

	for (var row in result.rows) {
		price.push(result.rows[row]['price']);
	}
	table_info['contracts']['price'] = price;

	for (var row in result.rows) {
		employeeid.push(result.rows[row]['employeeid']);
	}
	table_info['contracts']['employeeid'] = employeeid;

	for (var row in result.rows) {
		driverslicense.push(result.rows[row]['driverslicense']);
	}
	table_info['contracts']['driverslicense'] = driverslicense;

	for (var row in result.rows) {
		vin.push(result.rows[row]['vin']);
	}
	table_info['contracts']['vin'] = vin;

	return table_info;
}

function handleCarManufacturersStatistics(table_info, result) {
	table_info['carmanufacturers'] = {};

	var businessid = [];
	var name = [];
	var streetaddress = [];
	var city = [];
	var province = [];

	for (var row in result.rows) {
		businessid.push(result.rows[row]['businessid']);
	}
	table_info['carmanufacturers']['businessid'] = businessid;

	for (var row in result.rows) {
		name.push(result.rows[row]['name']);
	}
	table_info['carmanufacturers']['name'] = name;

	for (var row in result.rows) {
		streetaddress.push(result.rows[row]['streetaddress']);
	}
	table_info['carmanufacturers']['streetaddress'] = streetaddress;

	for (var row in result.rows) {
		city.push(result.rows[row]['city']);
	}
	table_info['carmanufacturers']['city'] = city;

	for (var row in result.rows) {
		province.push(result.rows[row]['province']);
	}
	table_info['carmanufacturers']['province'] = province;

	return table_info;
}

function handleCustomersStatistics(table_info, result) {
	table_info['customers'] = {};

	var driverslicense = [];
	var name = [];
	var phonenumber = [];
	var email = [];
	var streetaddress = [];
	var city = [];
	var province = [];
	var governmentalid = [];

	for (var row in result.rows) {
		driverslicense.push(result.rows[row]['driverslicense']);
	}
	table_info['customers']['driverslicense'] = driverslicense;

	for (var row in result.rows) {
		name.push(result.rows[row]['name']);
	}
	table_info['customers']['name'] = name;

	for (var row in result.rows) {
		phonenumber.push(result.rows[row]['phonenumber']);
	}
	table_info['customers']['phonenumber'] = phonenumber;

	for (var row in result.rows) {
		email.push(result.rows[row]['email']);
	}
	table_info['customers']['email'] = email;

	for (var row in result.rows) {
		streetaddress.push(result.rows[row]['streetaddress']);
	}
	table_info['customers']['streetaddress'] = streetaddress;

	for (var row in result.rows) {
		city.push(result.rows[row]['city']);
	}
	table_info['customers']['city'] = city;

	for (var row in result.rows) {
		province.push(result.rows[row]['province']);
	}
	table_info['customers']['province'] = province;

	for (var row in result.rows) {
		governmentalid.push(result.rows[row]['governmentalid']);
	}
	table_info['customers']['governmentalid'] = governmentalid;

	return table_info;
}

function handleTransactionsStatistics(table_info, result) {
	table_info['transactions'] = {};

	var transactionid = [];
	var paymenttype = [];
	var time = [];
	var accountid = [];
	var amount = [];
	var contractid = [];

	for (var row in result.rows) {
		transactionid.push(result.rows[row]['transactionid']);
	}
	table_info['transactions']['transactionid'] = transactionid;

	for (var row in result.rows) {
		paymenttype.push(result.rows[row]['paymenttype']);
	}
	table_info['transactions']['paymenttype'] = paymenttype;

	for (var row in result.rows) {
		time.push(result.rows[row]['time']);
	}
	table_info['transactions']['time'] = time;

	for (var row in result.rows) {
		accountid.push(result.rows[row]['accountid']);
	}
	table_info['transactions']['accountid'] = accountid;

	for (var row in result.rows) {
		amount.push(result.rows[row]['amount']);
	}
	table_info['transactions']['amount'] = amount;

	for (var row in result.rows) {
		contractid.push(result.rows[row]['contractid']);
	}
	table_info['transactions']['contractid'] = contractid;

	return table_info;
}

function handlePerformsStatistics(table_info, result) {
	table_info['performs'] = {};

	var vin = [];
	var employeeid = [];
	var maintenanceid = [];

	for (var row in result.rows) {
		vin.push(result.rows[row]['vin']);
	}
	table_info['performs']['vin'] = vin;

	for (var row in result.rows) {
		employeeid.push(result.rows[row]['employeeid']);
	}
	table_info['performs']['employeeid'] = employeeid;

	for (var row in result.rows) {
		maintenanceid.push(result.rows[row]['maintenanceid']);
	}
	table_info['performs']['maintenanceid'] = maintenanceid;

	return table_info;
}


function getStatistics(relation, where, callback) {
		var table_info = {}
    var sql_query = "SELECT * FROM " + relation + " " + where;
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
      } else if (relation == 'carmanufacturer'){
        table_info = handleCarManufacturersStatistics(table_info, result);
      } else if ( relation == 'car' ) {
				table_info = handleCarStatistics(table_info,result);
      } else if ( relation == 'transaction' ) {
				table_info = handleTransactionsStatistics(table_info,result);
			} else if ( relation == "option") {
				table_info = handleOptionStatistics(table_info, result);
			} else if ( relation == "customer") {
				table_info = handleCustomersStatistics(table_info, result);
			} else if ( relation == "mechanics" ) {
				table_info = handleMechanicStatistics(table_info, result);
			} else if ( relation == "maintenances" ) {
				table_info = handleMaintenancesStatistics(table_info, result);
			} else if ( relation == "contract" ) {
				table_info = handleContractsStatistics(table_info, result);
			} else if ( relation == "performs" ) {
				table_info = handlePerformsStatistics(table_info, result);
			}

			return callback(table_info);
    });
  });	
}

function executeQuery(sql_query, callback) {
    pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query(sql_query, function(err, result) {
      done(err);
      if(err) {
				console.log(err);
        return callback('error running query', err);
      }

			console.log(result);
			return callback(result);
    });
  });	
}

function deleteAlternative(make, year, option, employeeid, callback) {
	var query_vin= "SELECT DISTINCT co.vin FROM maintenances m, carsandoptions co WHERE m.vin = co.vin AND co.make = '"+ make +"' AND co.year = '"+ year +"' AND optiontype = '"+ option +"' AND employeeid = '"+employeeid+"';"	
	var selected_vin = [];
	executeQuery(query_vin, function(result) {
		for (var row in result.rows) {
			selected_vin.push("'"+result.rows[row]['vin']+"'");
		}

		if (result.rowCount) {
			var deleteQuery_transaction = 'DELETE FROM transaction WHERE contractid IN (SELECT contractid FROM contract WHERE vin IN ('+selected_vin.join(',')+'))';
			executeQuery(deleteQuery_transaction, function(result) {

				var deleteQuery_contract = 'DELETE FROM contract WHERE vin IN ('+selected_vin.join(',')+')';
				executeQuery(deleteQuery_contract, function(result) {

					var deleteQuery_features = 'DELETE FROM features WHERE vin IN ('+selected_vin.join(',')+')';
					executeQuery(deleteQuery_features, function(result) {
						
						var deleteQuery_performs= 'DELETE FROM performs WHERE vin IN ('+selected_vin.join(',')+')';
						executeQuery(deleteQuery_performs, function(result) {
							
							var deleteQuery_car = 'DELETE FROM car WHERE vin IN ('+selected_vin.join(',')+')';
							executeQuery(deleteQuery_car, function(result) {
								return callback(selected_vin);
							});
						});
					});
				});
			});
		} else 
				return callback(0);
	});
}

function createAlternative(bo_sql, e_sql, m_sql, callback) {
	executeQuery(bo_sql, function(result_bo, err_bo) {
		if (err_bo) {
			table_infos.errors_bo.push(err_bo.detail);
			return callback(err_bo.detail);
		}

		if(result_bo.rowCount) {
			executeQuery(e_sql, function(result_e, err_e){
				if (err_e) {
					table_infos.errors_e.push(err_e.detail);
					return callback(err_e.detail);
				}

				if (result_e.rowCount) {
					executeQuery(m_sql, function(result, err_m) {
						if (err_m)
							return callback(err_m.detail);

						return callback(result.rowCount);
					});
				} else
						return callback("failed insert employee");

			});
		} else
				return callback("failed insert branch office")
	});
}

function updateAlternative(eid, increase_amt, callback) {
	var update_sql = "UPDATE employee SET salary = salary + " + increase_amt + " WHERE employeeid = '" + eid + "'"; 
	console.log(update_sql); 
	executeQuery(update_sql, function(result, err) {
			if(err)
					return callback(err.detail);
					
			return callback(result.rowCount);	
	})
}


//DELETE features
//DELETE CAR

app.post('/', function(req, res){
  var query_type = req.body.query_type;
  var table_info = {};
  if(query_type == "Get Statistics"){
    var selected_option = req.body.selected_table;
		getStatistics(selected_option,"", function(table_info) {
			res.render(selected_option+'_statistics', {table_info: table_info}); 
		});
  } else if (query_type == "Get Special Cars") {
		//TODO
		var selected_make = req.body.selected_make;
		var selected_year = req.body.selected_year;
		var selected_option = req.body.selected_option;
		var selected_mechanic = req.body.selected_mechanic;

		deleteAlternative(selected_make, selected_year, selected_option, selected_mechanic, function(msg) {
			if (msg) {
				table_infos['special_cars'] = msg;
				console.log(msg + "deleted");
				//TODO: need table_info... to reload the page.. we because have big FORM, need to output feeback 
			} else {
				console.log("nothing deleted");
			}
			refresh(req,res,null);
		});
	} else if (query_type == "Open New Branch Office With Manager") {
		var bo_branchid = req.body.bo_branchid;
		var bo_streetaddress= req.body.bo_streetaddress;
		var bo_city= req.body.bo_city;
		var bo_province= req.body.bo_province;

		if (bo_branchid.length > 3)
			table_infos.errors_bo.push("Branch ID's length must at most 3.");
		if (bo_branchid.length == 0)
			table_infos.errors_bo.push("Branch ID's cannot be empty.");
		if (bo_streetaddress.length == 0)
			table_infos.errors_bo.push("Branch Street Address cannot be empty.");
		if (bo_city.length == 0)
			table_infos.errors_bo.push("Branch City cannot be empty.");
		if (bo_province.length == 0)
			table_infos.errors_bo.push("Branch Province cannot be empty.");

		var insert_bo_sql = "INSERT INTO branchoffice VALUES ('" + bo_branchid + "','" + bo_streetaddress + "','" + bo_city + "','" + bo_province +"')";

		console.log(insert_bo_sql);

		var e_employeeid = req.body.e_employeeid;
		var e_name = req.body.e_name;
		var e_salary= req.body.e_salary;
		var e_streetaddress= req.body.e_streetaddress;
		var e_city= req.body.e_city;
		var e_province= req.body.e_province;
		var now = new Date();
		var e_date =  (now.getMonth()+1) + "-" + now.getDate() + "-" + now.getFullYear();

		if (e_employeeid.length > 6)
			table_infos.errors_e.push("Employee ID's length must at most 6.");
		if (e_employeeid.length == 0)
			table_infos.errors_e.push("Employee ID's cannot be empty..");
		if (e_name.length == 0)
			table_infos.errors_e.push("Employee's name cannot be empty.");
		if (e_salary.length == 0)
			table_infos.errors_e.push("Employee's salary cannot be empty.");
		if (!Number.isInteger(parseInt(e_salary)))
			table_infos.errors_e.push("Employee's salary has to be an integer.");
		if (parseInt(e_salary) < 20000 )
			table_infos.errors_e.push("Employee's salary has greater than 20000.");
		if (e_streetaddress.length == 0)
			table_infos.errors_e.push("Employee's Street Address cannot be empty.");
		if (e_city.length == 0)
			table_infos.errors_e.push("Employee's City cannot be empty.");
		if (e_province.length == 0)
			table_infos.errors_e.push("Employee's Province cannot be empty.");

		var insert_e_sql = "INSERT INTO employee VALUES ('" + e_employeeid + "','" + e_name + "'," + e_salary + ",'"+ bo_branchid + "','" + e_streetaddress + "','" + e_city + "','" + e_province + "','" + e_date + "')";

		var insert_m_sql = "INSERT INTO manager VALUES ('" + e_employeeid + "')";

		console.log(insert_e_sql);
		console.log(insert_m_sql);

		if (table_infos.errors_bo.length == 0 && table_infos.errors_e.length == 0) {
			createAlternative(insert_bo_sql, insert_e_sql, insert_m_sql, function(msg) {
				if (Number.isInteger(msg))
					table_infos.success_insert.push("A New Branch Office " + bo_branchid +" has been created with Manager " + e_name + " !");
				console.log("INSERT " + msg);
			});
		} else {
			console.log("Creating a new branch office wtih manager errors !"); 
		}

		refresh(req,res,null);
	} else if ( query_type == "Make An Increase") {
		var selected_employee = req.body.selected_employee;
		var increase_amt = req.body.increase_amt;

		if (increase_amt.length == 0)
			table_infos.errors_amt.push("Amount cannot be empty.");
		if (!Number.isInteger(parseInt(increase_amt)))
			table_infos.errors_amt.push("Amount has to be an integer.");
		if (parseInt(increase_amt) < 0 )
			table_infos.errors_amt.push("Amount has greater than 0.");

		if (table_infos.errors_amt.length == 0) {
			updateAlternative(selected_employee, increase_amt, function(msg) {
				if (Number.isInteger(msg)) {
						var idx = table_infos.employees.employeeid.indexOf(selected_employee);
						var name = table_infos.employees.name[idx];
						table_infos.success_update.push("Increase salary of employee " + name+ " by " + increase_amt+ "$.");
				}

					console.log("UPDATE " +msg);
			});
		} else {
			console.log("Increase amount errors !");
		}


		console.log("MAKE AN INCREASE ! to " + selected_employee + " of " + increase_amt );
		refresh(req,res,null);
	} else if (query_type == "View Work") {

		var work_date = req.body.work_date;
		var arr_date = work_date.split('');
		
		if (work_date.length == 0)
			table_infos.errors_date.push("Date cannot be empty.");
		if (work_date.length != 10)
			table_infos.errors_date.push("Date's length must be 10.");
		for (var i = 0; i < arr_date.length; i++) {
			if (i != 2 && i != 5) {
				if (!Number.isInteger(parseInt(arr_date[i]))) {
					table_infos.errors_date.push("Date's has an i ncorrect format. Please respect MM-DD-YYYY.");
					break;
				}
			} else {
				if (arr_date[i] != "-") {
					table_infos.errors_date.push("Date's has an incorrect format. Please respect MM-DD-YYYY.");
					break;
				}
			} 
		}

		if (table_infos.errors_date.length == 0) {
			getStatistics("maintenances","WHERE maintenancedate = '"+work_date+"'", function(table_info) {
				getStatistics("contract","WHERE dateofinitiation = '"+work_date+"'", function(contract_info) {
					res.render('work_statistics', {table_info: table_info, contract_info : contract_info}); 
				});
			});
		} else {
			console.log("Work date errors !")
			refresh(req,res,null);
		}

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
