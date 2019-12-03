var db = require('../models/database.js');

var getMain = function(req, res) {
	  res.render('main.ejs', {error: req.query.error});
	};

var postMain = function(req, res) {
      var username = req.body.username;
      var password = req.body.password;
      //call db lookup to validate password
	  db.lookup(username, password, function(data, err) {
	    if (err || !data) {
	    	res.redirect('/?error=' + err);
	    } else {
	    	//set session to current user and redirect to dogs
	    	req.session.username = req.body.username;
			res.redirect('/dogmap');
	    }
	  });
	};

var getSignup = function(req, res) {
	  res.render('signup.ejs', {error: req.query.error});
	};

var postCreateAccount = function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var fullname = req.body.fullname;
	//call db signup to add user to table
	db.signup(username, password, fullname, function (data, err) {
		if (err || !data) {
			res.redirect('/signup?error=' + err);
		} else {
			//redirect to dogs after setting session to user
			req.session.username = req.body.username;
			res.redirect('/dogmap');
		}
	});
};

var getDogs = function(req, res) {
	if (req.session.username) {
		//create table using dogs table
		db.createtable(function (data, err) {
			if (err) {
				res.redirect('/dogmap?error=' + err);
			} else {
				req.session.table = JSON.stringify(data);
				res.render('dogmap.ejs', {user: req.session.username, error: req.query.error, 
					dogs: req.session.table});
			}
		});
	} else {
		res.redirect('/?error=Not%20Signed%20In');
	}
};

var postDog = function (req, res) {
	var dog = req.body.dog;
	var description = req.body.description;
	var creator = req.session.username;
	var latitude = req.body.latitude;
	var longitude = req.body.longitude;
	var photo = req.body.photo;
	var start = req.body.start;
	var end = req.body.end;
	//add dog to table in DynamoDB
	db.adddog(dog, description, creator, latitude, longitude, photo, start, end, function (data, err) {
		if (err || !data) {
			res.send(err);
		} else {
			res.redirect('/dogmap');
		}
	});
};

var getLogout = function (req, res) {
	req.session.destroy();
	res.redirect('/');
}

var getGeoData = function(req, res) {
	//interpret JSON to display in table
	if (req.session.username) {
		db.createtable(function (data, err) {
			if (err) {
				alert(err);
				res.redirect('/dogmap?error=' + err);
			} else {
				req.session.table = JSON.stringify(data);
				var dat = {user: req.session.username, error: req.query.error, 
						dogs: req.session.table};
				dat = JSON.stringify(dat);
				  res.send(dat);
			}
		});
	} else {
		res.redirect('/?error=Not%20Signed%20In');
	}
};

var deleteGeoData = function(req, res) {
	var dog = req.body.dog;
	var lat = req.body.latitude;
	var lon = req.body.longitude;
	//get index for dog
	db.getindex(dog, function(data, err) {
		if (err || !data) {
			res.send("Error");
		} else {
			/*iterate through all dogs and if the selected lat and long match
			the lat and long of one of the dog in the table, delete it*/
			for (var i = 0; i < data.length; i++) {
				if (JSON.parse(data[i].value).latitude === lat 
						&& JSON.parse(data[i].value).longitude === lon) {
					db.deletedog(dog, data[i].inx, function(info, err2) {
						res.send(dog);
					});
				}
			}
			
		}
	});
}


var routes = { 
  get_main: getMain,
  post_main: postMain,
  get_signup: getSignup,
  post_createaccount: postCreateAccount,
  get_dogs: getDogs,
  post_dogs: postDog,
  get_logout: getLogout,
  get_geodata: getGeoData,
  post_geodata: deleteGeoData
};

module.exports = routes;