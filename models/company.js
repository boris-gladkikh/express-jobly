const db = require("../db.js");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError.js");

class Company {
  //static method to get all companies - has multiple optional params
  //returns handle, name, num_employees, description, logo_url
  // Now prevents SQL Injection;


  static async getAll(search, min_employees, max_employees) {
    let queryString = `SELECT handle, name FROM companies`;
    let whereConditionArray = [];
    let counter = 1;
    let values = [];
    let result;

    if (min_employees && max_employees) {
      if (min_employees > max_employees) {
        let err = new ExpressError("parameters are incorrect", 400);
        throw err;
      }
    }
    if (search) {

      values.push(search);
      whereConditionArray.push(`name = $${counter}`);
      counter++;


    }
    if (min_employees) {

      values.push(min_employees);
      whereConditionArray.push(`num_employees > $${counter}`);
      counter++;

    }
    if (max_employees) {
      values.push(max_employees);
      whereConditionArray.push(`num_employees < $${counter}`);
      counter++;
    }

    if (whereConditionArray.length > 0) {
      result = await db.query(
        `${queryString} WHERE ${whereConditionArray.join(" and ")}`, values
      );
    } else {
      result = await db.query(`${queryString}`);
    }
    return result.rows;
  }

  //creates a new company and inserts it into database

  static async create(handle, name, num_employees, description, logo_url) {
    try {
      let result = await db.query(
        `INSERT INTO companies (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [handle, name, num_employees, description, logo_url]
      );
      return result.rows[0];
    } catch (err) {
      throw new ExpressError(`Handle ${handle} already taken!`, 400);
    }
  }

  //gets company by handle and returns all jobs with handle

  static async get(handle) {
    let result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
      FROM companies
      WHERE handle = $1`,
      [handle]
    );

    let resultJobs = await db.query(
      `SELECT title, salary, equity, company_handle, date_posted
      FROM jobs
      WHERE company_handle = $1`,
      [handle]
    );

    if (result.rows.length !== 0) {  
      result.rows[0].jobs = resultJobs.rows;
      return result.rows[0];
    } else {
      let error = new ExpressError(`${handle} company doesn't exist`, 404);
      throw error;
    }
  }

  //updates the company using the helper function to create query string

  static async update(handle, results) {
    let { query, values } = partialUpdate(
      "companies",
      results,
      "handle",
      handle
    );
    let result = await db.query(`${query}`, values);
    if (result.rows.length !== 0) {
      return result.rows[0];
    } else {
      throw new ExpressError("company not found", 404);
    }
  }

  static async delete(handle) {
    let result = await db.query(
      `DELETE FROM companies
      WHERE handle=$1
      RETURNING handle`,
      [handle]
    );
    if (result.rows.length !== 0) {
      return result.rows[0];
    } else {
      throw new ExpressError("Company not found", 404);
    }
  }
}

module.exports = Company;
