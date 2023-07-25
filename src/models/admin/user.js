'use strict';

const { QueryTypes, } = require('sequelize');
const config = require('../../config');
const db = require('../../database');

/**
 * @param {Number} id The authenticated dashboard user's id.
 * @return {object|false}
 */
const getStats = async (id) => {
  let res = false;
  try {
    const [results, metadata] = await db.query(
      `SELECT count(users.uid) as users_count
      FROM users;`,
    );
    res = { users_count: results.users_count, }
    return { ...res, }
  } catch(err) {
    return res;
  }
};

module.exports = {
  getStats,
};
