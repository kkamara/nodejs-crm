'use strict';
const express = require('express');
const deepClone = require('deep-clone');
const config = require('../../config');
const { getUserByToken, } = require('../../models/user');
const { getStats, } = require('../../models/admin/user');

const dashboard = express.Router();

dashboard.get('/', async (req, res) => {
  req.session.page = { title: 'Admin Dashboard', };
  req.session.auth = null;

  await new Promise((resolve, reject) => {
    req.session.save(function(err) {
      if (err) {
        console.log(err)
        return reject(err);
      }
      resolve()
    });
  });
  
  const newSession = { page: req.session.page, auth: req.session.auth, };
  const session = deepClone(newSession);
  await new Promise((resolve, reject) => {
    req.session.destroy(function(err) {
      if (err) {
        console.log(err)
        return reject(err);
      }
      resolve();
    });
  });
  
  return res.render(
    'admin/dashboard.pug',
    {
      config,
      title: session.page.title,
      session,
    }
  );
});

dashboard.post('/', async (req, res) => {
  if (
    !req.headers.authorization || 
    null === req.headers.authorization.match(/Basic /)
  ) {
    res.status(401);
    return res.json({ message: 'Unauthorized.' });
  }

  const token = req.headers.authorization
    .replace('Basic ', '');
  req.session.auth = await getUserByToken(token);
  req.session.auth.token = token;
  if (req.session.auth === false) {
    res.status(401);
    return res.json({ 
      message: 'Unauthorized.',
      error: 'Error encountered when getting user details with authorized token.',
    });
  }

  req.session.page = { title: 'Admin Authenticate', };
  
  await new Promise((resolve, reject) => {
    req.session.save(function(err) {
      if (err) {
        console.log(err)
        return reject(err);
      }
      resolve()
    });
  });

  const stats = await getStats(
    req.session.auth.uid,
  );
  if (stats === false) {
    res.status(500);
    return res.json({ 
      message: 'Internal Server Error.',
      error: 'Encountered error when retrieving your stat data.',
    });
  }
  
  const newSession = { page: req.session.page, auth: req.session.auth, };
  const session = deepClone(newSession);
  await new Promise((resolve, reject) => {
    req.session.destroy(function(err) {
      if (err) {
        console.log(err)
        return reject(err);
      }
      resolve();
    });
  });
  
  return res.json({ 
    message: 'Success',
    data: stats,
  });
});

module.exports = dashboard;