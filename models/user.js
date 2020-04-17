const db = require("../db.js");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError.js");
const { BCRYPT_WORK_FACTOR } = require('../config.js')
const bcrypt = require('bcrypt');

class User {
  // creates a new user and inserts it into database
  static async create(
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin
  ) {
    try {
      let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      let result = await db.query(
        `INSERT INTO users (username,
          password,
          first_name,
          last_name,
          email,
          photo_url,
          is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [username, hashedPassword, first_name, last_name, email, photo_url, is_admin]
      );

      return result.rows[0];
    } catch (err) {
      throw new ExpressError(`Bad user input data! ${err.message}`, 400);
    }
  }

  // get all users
  static async getAll() {
    let result = await db.query(
      "SELECT username, first_name, last_name, email FROM users"
    );

    return result.rows;
  }

  // get user by username
  static async get(username) {
    let result = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users
      WHERE username = $1`,
      [username]
    );
    if (result.rows.length !== 0) {
      return result.rows[0];
    } else {
      let error = new ExpressError(`User ${username} doesn't exist`, 404);
      throw error;
    }
  }

  //updates the user using the helper function to create query string

  static async update(username, results) {
    try {
      let { query, values } = partialUpdate(
        "users",
        results,
        "username",
        username
      );
      let result = await db.query(`${query}`, values);
      if (result.rows.length !== 0) {
        return result.rows[0];
      } else {
        throw new ExpressError(`User ${username} not found`, 404);
      }
    } catch (err) {
      throw new ExpressError("Incorrect body or user data!", 400);
    }
  }

  static async delete(username) {
    let result = await db.query(
      `DELETE FROM users
      WHERE username=$1
      RETURNING username`,
      [username]
    );
    if (result.rows.length !== 0) {
      return result.rows[0];
    } else {
      throw new ExpressError(`User ${username} not found`, 404);
    }
  }

  //authenticate user 
  static async authenticate(username,password) {
    let savedPassword = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]
    );

    if (savedPassword.rows.length === 0) {
      throw new ExpressError(`Cannot find ${username}`, 400);
    }

    let authenticated = await bcrypt.compare(password, savedPassword.rows[0].password)

    return authenticated;

  }


  // query for username, is_admin to use with our token for logging in

  static async getIsAdmin(username){
    let result = await db.query(
      `SELECT is_admin
      FROM users
      WHERE username = $1`,
      [username]
    );

    return result.rows[0];
  }


}

module.exports = User;
