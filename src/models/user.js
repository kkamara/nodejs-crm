'use strict';

const { QueryTypes, } = require('sequelize');
const config = require('../config');
const db = require('../database');
const { validate, } = require('email-validator');
const { 
  scryptSync, 
  randomBytes, 
  timingSafeEqual,
} = require('crypto');

/**
 * Returns the salt and hash
 * @param {string} plainText
 * @return {object} Like { salt, hash, }.
 */
const encrypt = (plainText) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plainText, salt, 64)
    .toString('hex');
  return { salt, hash, };
};

/**
 * Compare resulting hashes.
 * @param {string} plainText
 * @param {string} hash
 * @param {string} hashSalt
 * @return {bool}
 */
const compare = (plainText, hash, hashSalt) => {  
  let res = false;
  const hashedBuffer = scryptSync(
    plainText, hashSalt, 64,
  );

  const keyBuffer = Buffer.from(hash, 'hex');
  const match = timingSafeEqual(hashedBuffer, keyBuffer);
  
  if (!match) {
      return res;
  }

  res = true;
  return res;
};

/**
 * @param {Number} id
 * @return {object|false}
 */
const refreshUser = async (id) => {
  let res = false;
  try {
    const [results, metadata] = await db.query(
      `UPDATE users SET updated_at=strftime('%Y-%m-%d %H-%M-%S', 'now')
        WHERE users.uid = :id`, 
      {
            replacements: { id, },
            type: QueryTypes.UPDATE,
      },
    );
  } catch(err) {
    return res;
  }
  
  res = await getUserById(id);
  return res;
};

/**
 * @param {string} id
 * @return {object|false}
 */
const getUserById = async (id) => {
  let res = false;
  try {
    const [result, metadata] = await db.query(
      `SELECT uid, password, building_number, city, contact_number, 
      created_at, email, email_reset_key, first_name, 
      last_name, password, last_login, remember_token, street_name,
      updated_at, username FROM users WHERE users.uid=? LIMIT 1`, 
      {
          replacements: [ id, ],
          type: QueryTypes.SELECT,
      },
    );
    res = result;
    return res;
  } catch(err) {
    return res;
  }
};

/**
 * @param {string} token
 * @return {object|false}
 */
const getUserByToken = async (token) => {
  let res = false;
  try {
    const [result, metadata] = await db.query(
      `SELECT users.uid, users.password, users.building_number, users.city, users.contact_number, 
      users.created_at, users.email, users.email_reset_key, users.first_name, 
      users.last_name, users.password, users.last_login, users.remember_token, users.street_name,
      users.updated_at, users.username FROM users 
      LEFT JOIN users_tokens ON users_tokens.users_id = users.uid
      WHERE users_tokens.token=? LIMIT 1`, 
      {
          replacements: [ token, ],
          type: QueryTypes.SELECT,
      },
    );
    res = result;
    return res;
  } catch(err) {
    return res;
  }
};

/**
 * @param {string} email
 * @return {object|false}
 */
const getUser = async (email) => {
  let res = false;
  try {
    const [result, metadata] = await db.query(
      `SELECT uid, password, password_salt, building_number, city, contact_number, 
    created_at, email, email_reset_key, first_name, 
    last_name, password, last_login, remember_token, street_name,
    updated_at, username FROM users WHERE users.email=? LIMIT 1`, 
    {
        replacements: [ email, ],
        type: QueryTypes.SELECT,
    },
  );
    res = result;
    return res;
  } catch(err) {
    if (config.nodeEnv !== 'production') {
      console.log('error : '+err.message);
    }
    return res;
  }
};

/**
 * 
 * @param {Number} id User's id.
 * @return {string|false} String token. 
 */
const getNewToken = async (id) => {
  const result = encrypt(config.appKey);
  try {
    const [addToken, metadata] = await db.query(
      `INSERT INTO users_tokens(
        users_id, token, created_at, updated_at
      ) VALUES(
        ?, ?, strftime('%Y-%m-%d %H-%M-%S', 'now'), strftime('%Y-%m-%d %H-%M-%S', 'now')
      )`, 
      {
          replacements: [ id, result.hash, ],
            type: QueryTypes.INSERT,
      },
    );
    
    const user = await refreshUser(id);
    if (user === false) {
      return false;
    }
    return result.hash;
  } catch(err) {
    if (config.nodeEnv !== 'production') {
      console.log('error : '+err.message);
    }
    return false;
  }
};

/**
 * Authenticate user credentials.
 * @param {string} email
 * @param {string} password
 * @return {object|false}
 */
const authenticate = async (email, password) => {
  let res = false;
    
  const user = await getUser(email);
  if (!user) {
    return res;
  }
  
  const compareHash = compare(
    password,
    user.password,
    user.password_salt
  );
  if (compareHash === false) {
    return res;
  }

  res = await refreshUser(user.uid);
  return res;
};

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @return {true|array}
 */
const validateAuthenticate = (email, password) => {
  let res = [];
  if (!email) {
    res.push('Missing email field.');
  } else if (email.length > 1024) {
    res.push('Email field exceeds 1024 character limit.')
  } else if (!validate(email)) {
    res.push('Email field must be a valid email.')
  }
  if (!password) {
    res.push('Missing email field.');
  } else if (password.length > 100) {
    res.push('Password field exceeds 100 character limit.')
  }

  if (!res.length) {
    res = true;
  }
  return res;
};

module.exports = {
  authenticate,
  validateAuthenticate,
  getNewToken,
  encrypt,
  compare,
  getUserByToken,
};
