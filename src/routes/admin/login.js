'use strict';
const express = require('express');
const deepClone = require('deep-clone');
const config = require('../../config');
const db = require('../../models/index');
const { ACCESS_ADMIN, } = require('../../constants/permissions');

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
  
  const validInput = db.sequelize.models
    .User
    .validateAuthenticate(email, password);  
  if (validInput instanceof Array) {
    res.status(400);
    return res.json({ 
      message: 'Bad request.',
      errors: validInput,
    });
  }
  
  try {
    req.session.auth = await db.sequelize.models
      .User
      .authenticate(email, password);
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
    const hasPermission = await db.sequelize.models
      .User
      .userHasPermission(req.session.auth.uid, ACCESS_ADMIN);
    if (hasPermission === false) {
      res.status(401);
      return res.json({ 
        message: 'Unauthorized.',
        error: 'Unauthorized.', /* error is shown in frontend validation */
      });
    }
  } catch (err) {
    res.status(401);
    return res.json({ 
      message: 'Unauthorized.',
      error: 'Unauthorized.',
    });
  }
  try {
    req.session.auth.token = await db.sequelize.models
      .User
      .getNewToken(
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