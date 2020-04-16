const db = require("../db.js");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError.js");

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
        [username, password, first_name, last_name, email, photo_url, is_admin]
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
      throw new ExpressError("Incorrect body data!", 400);
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
}

module.exports = User;
