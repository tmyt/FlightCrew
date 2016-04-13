'use strict';

const path = require('path');
const express = require('express')
    , passport = require('passport')
    , bodyParser = require('body-parser')
    , jadeStatic = require('jade-static')
    , app = express()
    , server = require('http').createServer(app);

const SqlDb = require('./lib/sqldb.js')
    , sdb = new SqlDb('./db/clients.sqlite3')
    , Q = require('q');

// check env vars
let error = [];
if(!process.env.CLIENT_ID) error.push('Env `CLIENT_ID` is not set');
if(!process.env.CLIENT_SECRET) error.push('Env `CLIENT_SECRET` is not set');
if(!process.env.CALLBACK_URI) error.push('Env `CALLBACK_URI` is not set');
if(!process.env.ADMIN_ACCOUNT) error.push('Env `ADMIN_ACCOUNT` is not set');
if(!process.env.APPNAME) error.push('Env `APPNAME` is not set');

if(error.length > 0){
  app.get('/', (req, res) => {
    res.send(error.join('<br />'));
  });
}else{
  // setup
  const auth = require('./lib/auth');
  auth.install(passport);
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(require('express-session')({
    secret: 'atashi',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // handlers
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
  app.get('/', (req, res) => {
    let account = req.user && req.user.account;
    let db, users;
    sdb.get()
      .then(d => Q(db = d))
      .then(_ => db.all('SELECT * FROM users'))
      .then(ids => { users = ids.length; return Q(db); })
      .then(_ => db.all('SELECT * FROM users WHERE account = ?', account || ''))
      .then(ids => {
        res.render('index', {
          account: account,
          exists: ids.length > 0,
          is_admin: process.env.ADMIN_ACCOUNT === account,
          name: process.env.APPNAME,
          users: users
        });
      });
  });

  // delegate path
  app.use('/auth', auth);
  app.use('/api', require('./api'));

  app.set('view engine', 'jade');
  app.use('/', jadeStatic(path.resolve('./views')));
  app.use('/', express.static('./public'));
}

server.listen(process.env.PORT || 3000, process.env.ADDR || '127.0.0.1');
