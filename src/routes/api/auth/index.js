'use strict';
const express = require('express');
const login = require('./login');
const authenticate = require('./authenticate');

const router = express.Router();

router.use('/', login);
router.use('/authenticate', authenticate);

module.exports = router;