'use strict';

const router = require('express').Router();

const SqlDb = require('./lib/sqldb.js')
    , sdb = new SqlDb('./db/clients.sqlite3')
    , Q = require('q');

router.get('/join', (req, res) => {
  if(!req.user) return res.sendStatus(400);
  sdb.get()
     .then(d => d.run('INSERT INTO users (account) VALUES (?)', req.user.account))
     .then(_ => {
       res.redirect('/');
     });
});

router.get('/leave', (req, res) => {
  if(!req.user) return res.sendStatus(400);
  sdb.get()
     .then(d => d.run('DELETE FROM users WHERE account = ?', req.user.account))
     .then(_ => {
       res.redirect('/');
     });
});

router.get('/download', (req, res) => {
  if(!req.user) return res.sendStatus(400);
  if(req.user.account !== process.env.ADMIN_ACCOUNT) return res.sendStatus(400);
  sdb.get()
     .then(d => d.all('SELECT * FROM users'))
     .then(ids => {
       res.attachment('users.csv');
       res.set('Content-Type', 'text/csv');
       console.log(ids);
       res.send(ids.map(s => `"${s.account}"`).join('\r\n'));
     })
     .catch(e => {
       res.sendStatus(500);
     });
});

module.exports = router;
