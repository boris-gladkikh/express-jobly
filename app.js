/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const app = express();
const companyRoutes = require("./routes/companies.js");
const jobRoutes = require("./routes/jobs.js");
const userRoutes = require("./routes/users.js");
app.use(express.json());

// add logging system
app.use(morgan("tiny"));

app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

//TODO: wrap console.err in same if statement as expresserror.js statement

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  if (process.env.NODE_ENV != "test") {
    console.error(this.stack);
  }

  return res.json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
