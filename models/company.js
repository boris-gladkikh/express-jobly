const db = require("../db.js");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError.js");




class Company {
  
  //static method to get all companies - has multiple optional params

  //returns handle, name, num_employees, description, logo_url

  static async getAll(search, min_employees, max_employees){
    let queryString = `SELECT handle, name FROM companies`
    let whereConditionArray = [];
    console.log("this is our search\n\n\n\n", search);

    if(search){
       whereConditionArray.push(`name = '${search}'`);
    }
    if(min_employees){
      whereConditionArray.push(`num_employees > ${min_employees}`); 
    }
    if(max_employees){
      whereConditionArray.push(`num_employees < ${max_employees}`); 
    }
    if(min_employees && max_employees) {
      if(min_employees > max_employees) {
        let err = new ExpressError("parameters are incorrect",400);
        throw err;
      }
    }
    if(whereConditionArray.length > 0){
      let result = await db.query(
        `${queryString} WHERE ${whereConditionArray.join(" and ")}`
      );
      console.log("this is our result", result)
      return result.rows;

    }
    else {
      let result = await db.query(
        `${queryString}`
        );
        return result.rows;

    }
  }

  //creates a new company and inserts it into database

  static async create(handle, name, num_employees, description, logo_url){
    let result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [handle, name, num_employees, description, logo_url]
    )
    return result.rows[0];
  }

  static async get(handle){
    let result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
      FROM companies 
      WHERE handle = $1`,
      [handle]
    )
    if(result.rows.length !== 0){
      return result.rows[0];
    } else {
      let error = new ExpressError(`${handle} company doesn't exist`,400)
      throw error
    }
  }

  //updates the company using the helper function to create query string

  static async update(handle,results) {
    let queryObject = partialUpdate("companies",results,"handle",handle);
    let result = await db.query(
      `${queryObject.query}`,queryObject.values
    );
    if(result.rows.length !== 0) {
      return result.rows[0];
    }
    else{
      throw new ExpressError("company not found", 404);
    }
  }

  static async delete(handle) {
    let result = await db.query(
      `DELETE FROM companies
      WHERE handle=$1
      RETURNING handle`
      ,
      [handle]
    );
  if(result.rows.length !==0) {
    return result.rows[0];
  }
  else {
    throw new ExpressError("Company not found",404);
  }
  }

}

module.exports = Company;