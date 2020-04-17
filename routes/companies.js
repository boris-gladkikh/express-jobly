const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError.js");
const jsonschema = require("jsonschema");
const Company = require("../models/company.js");
const companiesSchema = require("../schemas/companiesSchema.json");
const companiesUpdateSchema = require("../schemas/companiesUpdateSchema.json");
const auth = require("../helpers/authMiddleware.js");

//create new company post route

router.post("/",
  auth.authenticateJWT,
  auth.ensureIsAdmin,
  async function (req, res, next) {
    try {
      const validationResult = jsonschema.validate(req.body, companiesSchema);

      if (!validationResult.valid) {
        // pass validation errors to error handler
        //  (the "stack" key is generally the most useful)
        let listOfErrors = validationResult.errors.map((error) => error.stack);
        let error = new ExpressError(listOfErrors, 400);
        return next(error);
      }

      let { handle, name, num_employees, description, logo_url } = req.body;
      let result = await Company.create(
        handle,
        name,
        num_employees,
        description,
        logo_url
      );
      return res.json({ company: result });
    } catch (err) {
      return next(err);
    }
  });

//get companies

router.get("/",
  auth.authenticateJWT,
  auth.ensureLoggedIn,
  async function (req, res, next) {
    try {
      let { search, min_employees, max_employees } = req.query;
      let result = await Company.getAll(search, min_employees, max_employees);
      return res.json({ companies: result });
    } catch (err) {
      return next(err);
    }
  });

//get company by handle

router.get("/:handle", auth.authenticateJWT, async function (req, res, next) {
  try {
    let handle = req.params.handle;
    let result = await Company.get(handle);
    return res.json({ company: result });
  } catch (err) {
    return next(err);
  }
});

//partially update a company specified by the handle

router.patch("/:handle",
  auth.authenticateJWT,
  auth.ensureIsAdmin,
  async function (req, res, next) {
    try {
      const validationResult = jsonschema.validate(
        req.body,
        companiesUpdateSchema
      );

      if (!validationResult.valid) {
        // pass validation errors to error handler
        //  (the "stack" key is generally the most useful)
        let listOfErrors = validationResult.errors.map((error) => error.stack);
        let error = new ExpressError(listOfErrors, 400);
        return next(error);
      }

      let handle = req.params.handle;
      let result = await Company.update(handle, req.body);
      return res.json({ company: result });
    } catch (err) {
      return next(err);
    }
  });

//delete a company by handle

router.delete("/:handle",
  auth.authenticateJWT,
  auth.ensureIsAdmin,
  async function (req, res, next) {
    try {
      let handle = req.params.handle;
      await Company.delete(handle);
      return res.json({ message: "Company deleted!" });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;
