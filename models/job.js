const db = require("../db.js");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError.js");

class Job {
  //creates a new job and inserts it into database

  static async create(title, salary, equity, company_handle, date_posted) {
    try {
      let result = await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [title, salary, equity, company_handle, date_posted]
      );
      return result.rows[0];
    } catch (err) {
      throw new ExpressError(`Bad job input data! ${err.message}`, 400);
    }
  }

  // Now prevents SQL Injection;

  static async getAll(search, min_salary, min_equity) {
    let queryString = `SELECT title, company_handle FROM jobs`;
    let whereConditionArray = [];
    let counter = 1;
    let values = [];
    let result;

    if (search) {
      values.push(search);
      whereConditionArray.push(`title = $${counter}`);
      counter++;
    }
    if (min_salary) {
      values.push(min_salary);
      whereConditionArray.push(`salary > $${counter}`);
      counter++;
    }
    if (min_equity) {
      values.push(min_equity);
      whereConditionArray.push(`equity > $${counter}`);
      counter++;
    }

    if (whereConditionArray.length > 0) {
      result = await db.query(
        `${queryString} WHERE ${whereConditionArray.join(" and ")}
        ORDER BY date_posted DESC`,
        values
      );
    } else {
      result = await db.query(`${queryString} ORDER BY date_posted DESC`);
    }
    return result.rows;
  }

  static async get(id) {
    let result = await db.query(
      `SELECT title, salary, equity, company_handle, date_posted
      FROM jobs
      WHERE id = $1`,
      [id]
    );
    if (result.rows.length !== 0) {
      return result.rows[0];
    } else {
      let error = new ExpressError(`Job of id ${id} doesn't exist`, 400);
      throw error;
    }
  }

  //updates the company using the helper function to create query string

  static async update(id, results) {
    try {
      let { query, values } = partialUpdate("jobs", results, "id", id);
      let result = await db.query(`${query}`, values);
      if (result.rows.length !== 0) {
        return result.rows[0];
      } else {
        throw new ExpressError("Job not found", 404);
      }
    } catch (err) {
      throw new ExpressError("Incorrect body data!", 400);
    }
  }

  static async delete(id) {
    let result = await db.query(
      `DELETE FROM jobs
      WHERE id=$1
      RETURNING id`,
      [id]
    );
    if (result.rows.length !== 0) {
      return result.rows[0];
    } else {
      throw new ExpressError("Job not found", 404);
    }
  }
}

module.exports = Job;
