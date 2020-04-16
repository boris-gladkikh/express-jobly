const db = require("../db.js");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError.js");

class Job {
  //creates a new job and inserts it into database

  static async create(title, salary, equity, company_handle, date_posted) {
    try {
      console.log(title, salary, equity, company_handle, date_posted);
      let result = await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [title, salary, equity, company_handle, date_posted]
      );
      return result.rows[0];
    } catch (err) {
      // throw new ExpressError(`Bad job input data!`, 400);
    }
  }
}

module.exports = Job;
