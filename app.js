var express = require('express');
var routes = require('./routes/routes.js');
var app = express();

app.use(express.bodyParser());
app.use(express.logger("default"));
var session = require('express-session')
app.use(session({
  'secret': 'abcdefg'
}))

app.get('/', routes.get_main);
app.post('/checklogin', routes.post_main);
app.post('/createaccount', routes.post_createaccount);
app.get('/signup', routes.get_signup);
app.get('/dogmap', routes.get_dogs);
app.post('/adddog', routes.post_dogs);
app.get('/logout', routes.get_logout);
app.get('/getGeoData', routes.get_geodata);
app.post('/removeGeoData', routes.post_geodata);



/* Run the server */

app.listen(3000);
console.log('Server running on port 3000. Now open http://localhost:3000/ in your browser!');
