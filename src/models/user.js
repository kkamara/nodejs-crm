'use strict';
const { Model, } = require('sequelize');
const { QueryTypes, } = require('sequelize');
const config = require('../config');
const db = require('./index');
const { validate, } = require('email-validator');
const { 
  scryptSync, 
  randomBytes, 
  timingSafeEqual,
} = require('crypto');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
 
    static async getStats(id) {
      let res = false;
      try {
        const [results, metadata] = await db.query(
          `SELECT count(users.uid) as users_count
          FROM users;`,
        );
        res = { usersCount: results[0].users_count, }
        return { ...res, }
      } catch(err) {
        return res;
      }
    }

    /**
     * Returns the salt and hash
     * @param {string} plainText
     * @return {object} Like { salt, hash, }.
     */
    static encrypt(plainText) {
      const salt = randomBytes(16).toString('hex');
      const hash = scryptSync(plainText, salt, 64)
        .toString('hex');
      return { salt, hash, };
    }

    /**
     * Compare resulting hashes.
     * @param {string} plainText
     * @param {string} hash
     * @param {string} hashSalt
     * @return {bool}
     */
    compare(plainText, hash, hashSalt) {  
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
    }

    /**
     * @param {Number} id
     * @return {object|false}
     */
    async refreshUser(id) {
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
    }

    /**
     * @param {string} id
     * @return {object|false}
     */
    async getUserById(id) {
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
    }

    /**
     * @param {string} token
     * @return {object|false}
     */
    async getUserByToken(token) {
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
    }

    /**
     * @param {string} email
     * @return {object|false}
     */
    async getUser(email) {
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
    }

    /**
     * 
     * @param {Number} id User's id.
     * @return {string|false} String token. 
     */
    async getNewToken(id) {
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
    }

    /**
     * Authenticate user credentials.
     * @param {string} email
     * @param {string} password
     * @return {object|false}
     */
    async authenticate(email, password) {
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
    }

    /**
    * 
    * @param {string} email 
    * @param {string} password 
    * @return {true|array}
    */
    validateAuthenticate(email, password) {
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
    }
  }
  User.init({
    uid: DataTypes.INTEGER,
    userCreated: DataTypes.INTEGER,
    username: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    passwordSalt: DataTypes.STRING,
    contactNumber: DataTypes.STRING,
    streetName: DataTypes.STRING,
    buildingNumber: DataTypes.STRING,
    city: DataTypes.STRING,
    postcode: DataTypes.STRING,
    rememberToken: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    lastLogin: DataTypes.DATE,
    emailResetKey: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'User',
  });
  
  return User;
};