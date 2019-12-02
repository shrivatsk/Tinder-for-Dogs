var keyvaluestore = require('../models/keyvaluestore.js');
var kvs = new keyvaluestore('users');
var kvsdog = new keyvaluestore('dogs');
var async = require('async');
kvs.init(function(err, data){});
kvsdog.init(function(err,data){});


var myDB_lookup = function(username, password, route_callbck){
	//handle errors
	  if (!username) {
		  route_callbck(null, "No username entered");
	  } else if (!password) {
		  route_callbck(null,"No password entered");
	  } else {
		  //check if input password matches value from users DynamoDB table
		  kvs.get(username, function (err, data) {
		    if (err) {
		      route_callbck(null, "Lookup error: "+err);
		    } else if (data === null) {
		    	// username doesnt match key in table
		      route_callbck(null, "No such user exists");
		    } else {
		    	//JSON.parse to extract password from table value for username
		    	if (password === JSON.parse(data[0].value).password) {
		    		route_callbck({ password : JSON.parse(data[0].value).password, fullname : JSON.parse(data[0].value).fullname}, null);
		    	} else {
		    		//username key exists but passwords do not match
		    		route_callbck(null, "Incorrect password");
		    	}
			}
		  });
	  }
};

var myDB_signup = function(username, password, fullname, route_callbck) {
	//handle errors
	if (!username) {
		route_callbck(null, "No username entered");
	} else if (!password) {
		route_callbck(null,"No password entered");
	} else if (!fullname) {
		route_callbck(null,"No full name entered");
	} else {
		kvs.get(username, function (err, data) {
			if (err) {
				route_callbck(null, "Signup Error: "+ err);
			} else if (data) {
				route_callbck(null, "Username Already Exists");
			} else {
				//add user to users table in same format as in loader.js
				kvs.put(username, JSON.stringify({password: password, fullname: fullname}), function (err, data) {
					if (err) {
						route_callbck(null, err);
					} else {
						route_callbck(username, null);
					}
				});
			}
		});
	}
};

var myDB_createTable = function(route_callbck) {
	//creating table to display on website
	//iterate through all the keys in the dogs DynamoDB table
	kvsdog.scanKeys(function(err, data) {
		if (err) {
			route_callbck(null, err);
		} else {
			//init empty array of dogs
			var dogs = [];
			//append dog name(key) and value attributes to array for every key
			async.forEach(data, function (item, callback) {
				kvsdog.get(item.key, function (err, info) {
					var dog = JSON.parse(info[0].value);
					dogs.push({"dog": item.key, "latitude": dog.latitude, 
						"longitude": dog.longitude, "description": dog.description, "creator": dog.creator, "photo": dog.photo});
					callback();
				});
			}, function() {
				route_callbck(dogs, null);
			});
		}
	});
};

var myDB_addDog = function(dog, description, creator, latitude, longitude, photo, route_callbck) {
	//handle errors
	if (!dog) {
		route_callbck(null, "No dog name entered");
	} else if (!description) {
		route_callbck(null,"No contact information entered");
	} else if (!creator) {
		route_callbck(null,"No user currently  logged in");
	} else if (!latitude) {
		route_callbck(null,"No latitude entered");
	} else if (!longitude) {
		route_callbck(null,"No longitude entered");
	} else {
		//add dog from user input to dogs table
		kvsdog.put(dog, JSON.stringify({latitude: latitude, longitude: longitude, 
			description: description, creator: creator, photo: photo}), function (err, data) {
			if (err) {
				route_callbck(null, err);
			} else {
				route_callbck(dog, null);
			}
		});
	}
};

var myDB_getIndex = function(dog, route_callbck) {
	//get index of dog to help w deleting later
	if (!dog) {
		route_callbck(null, "No dog available");
	} else {
		kvsdog.get(dog, function(err, data) {
			if (err) {
				route_callbck(null, err);
			} else {
				route_callbck(data, null);
			}
		})
	}
}

var myDB_deleteDog = function(dog, inx, route_callbck) {
	//remove dog using name and index
		kvsdog.remove(dog, inx, function(err, data) {
			if (err) {
				route_callbck(null, err);
			} else {
				route_callbck(dog, null);
			}
		})
}

var database = { 
  lookup: myDB_lookup,
  signup: myDB_signup,
  createtable: myDB_createTable,
  adddog: myDB_addDog,
  getindex: myDB_getIndex,
  deletedog: myDB_deleteDog
  
};
                                        
module.exports = database;
                                        
