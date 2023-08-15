'use strict';
const express = require('express');
const { QueryTypes, } = require('sequelize');
const deepClone = require('deep-clone');
const config = require('../../config');
const { 
  validateAuthenticate,
  authenticate,
  getNewToken,
} = require('../../models/user');

const login = express.Router();

login.get('/', async (req, res) => {
  req.session.page = { title: 'Admin Login', };
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
  
  return res.render('admin/auth/login.pug', {
      config,
      title: session.page.title,
      session,
  });
});

login.post('/', async (req, res) => {
  req.session.page = { title: 'Admin Login Action', };
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
  
  const email = req.bodyString('email');
  const password = req.bodyString('password');
  
  const validInput = validateAuthenticate(email, password);  
  if (validInput instanceof Array) {
    res.status(400);
    return res.json({ 
      message: 'Bad request.',
      errors: validInput,
    });
  }
  
  try {
    req.session.auth = await authenticate(email, password);
    if (config.nodeEnv !== 'production') {
      console.log('req.session.auth :',req.session.auth)
    }
    if (req.session.auth === false) {
      res.status(400);
      return res.json({ 
        message: 'Invalid user and password combination.',
      });
    }
  } catch(err) {
    res.status(400);
    return res.json({ 
      message: 'Invalid user and password combination.',
    });
  }
  try {
    req.session.auth.token = await getNewToken(
      req.session.auth.uid,
    );
  } catch(err) {
    res.status(500);
    return res.json({ 
      message: 'Please try again and contact administrator.',
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
  
  res.status(200);
  return res.json({ 
    routeName: session.page.title,
    data: session, 
  });
});

module.exports = login;