let portNumber = 3000

import * as express from 'express'

import * as bodyParser from 'body-parser'
import * as methodOverride from 'method-override'
import {setDefaultRoutes} from './helpers/route'
import usermgt from './helpers/usermgt'
//import * as redis from 'redis'

import InitMongo from './mongo'

import router from './router'

// APPROACH 1: Using environment variables created by Docker
// var client = redis.createClient(
//      process.env.REDIS_PORT_6379_TCP_PORT,
//      process.env.REDIS_PORT_6379_TCP_ADDR
// );

// APPROACH 2: Using host entries created by Docker in /etc/hosts (RECOMMENDED)
/*let client = redis.createClient('6379', 'api_redis');
client.set("string key", "string val", redis.print);

client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function(err, replies) {
  console.log(replies.length + " replies:");
  replies.forEach(function(reply, i) {
    console.log("    " + i + ": " + reply);
  });
  client.quit();
});
*/
/////////////////////////////////////////////////////////////////////
// APP DEFINITION

var app = express();

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(bodyParser.json());       // to support JSON-encoded bodies

app.use(methodOverride())

app.use(function(req, res, next) {
  console.log('Time:', (new Date(Date.now())).toUTCString())
  next()
})

app.listen(portNumber, function() {
  console.log(`Example app listening on port ${portNumber}!`);
});

/////////////////////////////////////////////////////////////////////
// ERROR HANDLERS

// Console log
function logErrors(err, req, res, next) {
  console.error("Error :")
  if (typeof err == 'String') {
    console.error(err)
  } else if (err.stack) {
    console.error(err.stack)
  } else {
    console.dir(err)
  }
  next(err)
}

// Xhr error
function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(err.status || 500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

// Internal server exception
function errorHandler(err, req, res, next) {
  res.status(err.status || 500)
  res.send(`Server error : ${err}`)
}

/////////////////////////////////////////////////////////////////////
// ROUTE HELPERS



/////////////////////////////////////////////////////////////////////
// INIT DB
//InitMongo('flm', mainRouter)

/////////////////////////////////////////////////////////////////////
// ROUTER DEFINITION

/*
import * as ExpressSession from 'express-session'

function login() {
  try {
    app.get('/logged_in', passwordless.acceptToken(),
      function(req, res) {
        res.render('homepage');
      });

    app.get('/login', function(req, res) {
      res.render('login');
    });

    var users = [
      { id: 1, email: 'marc@example.com' },
      { id: 2, email: 'alice@example.com' }
    ];

    app.use(ExpressSession({
      secret: "i-love - husky",
      resave: false,
      saveUninitialized: true
    }));


  app.post('/sendtoken',
    passwordless.requestToken(
      function(user, delivery, callback) {
        console.log("test1");
        for (var i = users.length - 1; i >= 0; i--) {
          if (users[i].email === user.toLowerCase()) {
            return callback(null, users[i].id);
          }
        }
        callback(null, null);
      }),
    function(req, res) {
      console.log("test2");
      // success!
      res.render('sent');
    });
} catch (e) {
  console.log(`Failed to setup login route with error :`)
  console.dir(e)
}
}
console.log('test')
import * as passwordless from 'passwordless'
console.log('test2')
import * as RedisStore from 'passwordless-redisstore-bcryptjs'
console.log('test3')
import * as email from "emailjs"
console.log('test42')
var smtpServer = email.server.connect({
  user: 'nicolas@thomasson.fr',
  password: "",
  host: "auth.smtp.1and1.fr",
  ssl: false
});

passwordless.init(new RedisStore(6379, 'api_redis'))

passwordless.addDelivery(
  function(tokenToSend, uidToSend, recipient, callback) {
    var host = 'localhost:3000';
    smtpServer.send({
      text: 'Hello!\nAccess your account here: http://'
      + host + '?token=' + tokenToSend + '&uid='
      + encodeURIComponent(uidToSend),
      from: 'nicolas@thomasson.fr',
      to: recipient,
      subject: 'Token for ' + host
    }, function(err, message) {
      if (err) {
        console.log(err);
      }
      callback(err);
    });
  });

app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/' }));

let config = {
    db: {
        production: process.env.MONGOLAB_URI,
        development: "mongodb://api_mongo/usermgt-dev",
        test: "mongodb://api_mongo/usermgt-test",
    }
};
*/
import setupCompression from './helpers/compression'

function mainRouter() {
  //usermgt(app)
  setupCompression(app)
  router(app)
  setDefaultRoutes(app)

  app.use(logErrors)
  app.use(clientErrorHandler)
  app.use(errorHandler)
}

mainRouter()
