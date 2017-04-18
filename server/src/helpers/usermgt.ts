import * as R from 'ramda'
import * as passport from 'passport'
import * as session from 'express-session'

import proxy from './helpers/proxy'

import * as LocalStrategy from 'passport-local'

export default function usermgt(app) {
  app.use(session({
    secret: 'ytunolosabe',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  console.log('setup')

  let usersDb = [{ name: 'nicolas', pass: 'pass' }]

  let findUser = R.curry((name, db) => {
    return R.find(R.propEq('name', name))(db)
  })

  let checkUser = (name, pass, cb) => {
    let result = findUser(name, usersDb)
    if (result) {
      if (result.pass) {
        if (result.pass == pass) {
          cb(null, result)
        }
        else
          cb(null, false)
      }
      else {
        cb(null, false)
      }
    } else {
      cb(null, false)
    }
  }

  passport.use(new LocalStrategy(checkUser))

  passport.serializeUser(function(user, cb) {
    cb(null, user.name)
  })

  passport.deserializeUser(function(username, cb) {
    let user = findUser(username, usersDb)
    if(user) {
      cb(null,user)
    }else {
      cb(null)
    }
  })


  function authenticationMiddleware() {
    return function(req, res, next) {
      if (req.isAuthenticated()) {
        console.log('auth ok')
        return next()
      }
      console.log('auth NOK')
      res.redirect('/')
    }
  }

  app.get('/profile', authenticationMiddleware(), function(req, res, next) {
    console.log('Yes!');
    res.send('Hello World!!!');
  })

  app.get('/', function(req, res, next) {
    console.log('NO!');
    res.send('NO!!!');
  })

  app.get('/logout', function(req, res, next) {
    req.logout();
    console.log('LOG OUT!');
    res.send('LOG OUT!!!');
  })

  //app.set('dbUrl', config.db[app.settings.env]);
  // we're going to use mongoose to interact with the mongodb
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));
}
