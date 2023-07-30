'use strict';
const sequelize = require('../../database/index');
const Log = require('../../database/log');
const { log, error, } = require('console');

sequelize.sync().then(() => {
  log('Log table created successfully!');

  Log.create({})
  .then(() => { log('Log created.'); })
  .catch(() => { log('Unable to create user.'); });
  Log.create({})
  .then(() => { log('Log created.'); })
  .catch(() => { log('Unable to create user.'); });
  Log.create({})
  .then(() => { log('Log created.'); })
  .catch(() => { log('Unable to create user.'); });
}).catch((err) => {
  error('Unable to create table : ', err);
});