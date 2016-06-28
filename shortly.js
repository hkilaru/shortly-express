var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var bcrypt = require('bcrypt-nodejs');

var session = require('express-session');
var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(session({secret:'HarishRebecca'}));


var FBlogin = false;
app.get('/', function (req,res,next){
  console.log('redirected to /!')
  console.log("fBlogin", FBlogin);
 if(req.session.user || FBlogin) {
   console.log("one level in");
    res.render('index');
  } else{
   res.render('login');
  }
})


app.get('/facebook',
    function(req,res){
      console.log('/facebook')
       FBlogin = true;
      res.redirect('/');
 });

app.get('/create',
function(req, res) {
  res.render('index');
});
app.get('/logout', function(req,res){
  req.session.regenerate(function(err){
    console.log('session regenerated without username');
    res.redirect('/login')
  })

});
app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});
app.post('/login', function(request, response){
  var username = request.body.username;
  console.log(username)
    new User({username: username}).fetch().then(function(found) {
    if (found) {
      console.log(found);
      bcrypt.compare(request.body.password, found.password, function(err,res){
        if(res === false){
            console.log('user not found');
            response.redirect('/signup');
        } else {
            console.log("user found");
            request.session.regenerate(function(err){
                console.log("sessionID saved");
                request.session.user = username;
                response.render('index');
            })
        }
      })
    } else {
      console.log('user not found');
      res.redirect('/signup');
    }
  });
 });

app.post('/signup', function(req, res){
 var username = req.body.username;
 bcrypt.hash(req.body.password, null, null, function(err,hPass){
   new User({username: req.body.username, password: hPass}).fetch().then(function(found) {
    if (found) {
      res.redirect('/index');
    } else {
        var user = new User({
          username: req.body.username,
          password: hPass,
      });
        user.save().then(function(newUser) {
          Users.add(newUser);
          req.session.regenerate(function(err){
            console.log("sessionID saved");
            req.session.user = username;
        });
          res.redirect('/index');
      });
  }
});
})
})

app.get('/signup', function(req, res) {
  res.render('signup');
})

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
