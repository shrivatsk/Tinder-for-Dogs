var express = require('express')
var router = express.Router()
var isAuthenticated = require('../middlewares/isAuthenticated')
var User = require('../models/user.js')

router.get('/signup', function(req, res) {
  res.render('signup')
})

router.post('/signup', function(req, res, next) {
  var username = req.body.username
  var password = req.body.password
  var dogname = req.body.dogname
  var u = new User({ username: username, password: password, dogname: dogname })
  u.save(function(err) {
    if (err) {
      next(err)
    }
    if (!err) {
      res.redirect('/account/login')
    }
  })
})

router.get('/login', function(_, res) {
  res.render('login')
})

router.post('/login', function(req, res, next) {
  var username = req.body.username
  var password = req.body.password
  var dogname = req.body.dogname
  User.findOne({ username: username, password: password, dogname: dogname }, function(
    err,
    result
  ) {
    if (!err && result != null) {
      req.session.user = username
      req.session.dogname = dogname
      res.redirect('/')
    } else {
      next(new Error('invalid credentials'))
    }
  })
})

router.get('/logout', isAuthenticated, function(req, res) {
  req.session.user = ''
  req.session.dogname = ''
  res.redirect('/')
})
module.exports = router
