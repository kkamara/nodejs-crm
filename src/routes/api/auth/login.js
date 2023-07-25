'use strict';
const express = require('express');
const deepClone = require('deep-clone');
const {
  validateAuthenticate,
  authenticate,
  getNewToken,
} = require('../../../models/user');

const login = express.Router();

login.get('/', async (req, res) => {

  req.session.page = { 
    title: 'Login',
    loginEmails: [
      'admin@mail.com',
      'clientadmin@mail.com',
      'clientuser@mail.com',
    ],
  };
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
  
  res.status(200);
  return res.json({
      data: {
        routeName: session.page.title,
        user: session,
      },
  });
})

login.post('/', async (req, res) => {
  req.session.page = { 
    title: 'Login Action',
    loginEmails: [
      'admin@mail.com',
      'clientadmin@mail.com',
      'clientuser@mail.com',
    ],
  };
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

  const validInput = validateAuthenticate(
    req.bodyString('email'),
    req.bodyString('password'),
  );
  if (validInput !== true) {
    res.status(400);    
    return res.json({
      message: 'Bad request.',
      error: validInput[0],
    });
  }

  req.session.auth = await authenticate(
    req.bodyString('email'),
    req.bodyString('password'),
  );  
  if (false === req.session.auth) {
    res.status(400);
    return res.json({
      message: 'Bad Request.',
      error: 'Unable to authenticate user due to invalid combination.',
    });
  }
  
  req.session.auth.token = await getNewToken(
    req.session.auth.uid,
  );  
  if (false === req.session.auth.token) {
    res.status(500);
    return res.json({
      message: 'Internal Server Error.',
      error: 'Encountered unexpected error when creating a new token.',
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
    data: {
      routeName: session.page.title,
      data: session,
    },
  });
});

module.exports = login;