const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError.js");
const jsonschema = require("jsonschema");
const Job = require("../models/job.js");

//create new job post route

router.post("/", async function (req, res, next) {
  try {
    let { title, salary, equity, company_handle, date_posted } = req.body;
    let result = await Job.create(
      title,
      salary,
      equity,
      company_handle,
      date_posted
    );
    return res.json({ job: result });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
