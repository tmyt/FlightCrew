'use strict';

const qsql = require('q-sqlite3')
    , Q = require('q');

class SqlDb{
  constructor(dbPath){
    this.path = dbPath;
    this.db = null;
  }

  get(){
    let that = this;
    if(this.db) return Q(this.db);
    return qsql.createDatabase(this.path)
      .then(d => Q(that.db = d))
      .then(d => d.run('CREATE TABLE users(account text primary key)'))
      .catch(e => Q(that.db))
      .then(_ => Q(that.db));
  }
};

module.exports = SqlDb;
