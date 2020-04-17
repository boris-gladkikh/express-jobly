const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError.js");
const jsonschema = require("jsonschema");
const User = require("../models/user.js");
const usersSchema = require("../schemas/usersSchema.json");
const usersUpdateSchema = require("../schemas/usersUpdateSchema.json");
const { SECRET_KEY } = require("../config.js");
const jwt = require("jsonwebtoken");
const auth = require("../helpers/authMiddleware.js");


//create new user post route

router.post("/", async function (req, res, next) {
  try {
    const validationResult = jsonschema.validate(req.body, usersSchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = validationResult.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let {
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url,
      is_admin,
    } = req.body;

    let result = await User.create(
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url,
      is_admin
    );

    let token = jwt.sign({ username, is_admin }, SECRET_KEY);

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async function (req, res, next) {
  try {
    let result = await User.getAll();
    return res.json({ users: result });
  } catch (err) {
    return next(err);
  }
});

router.get("/:username", async function (req, res, next) {
  try {
    let username = req.params.username;
    let result = await User.get(username);
    return res.json({ user: result });
  } catch (err) {
    return next(err);
  }
});

//partially update a job specified by the id

router.patch("/:username",
  auth.authenticateJWT,
  auth.ensureCorrectUser,
  async function (req, res, next) {
    try {
      const validationResult = jsonschema.validate(req.body, usersUpdateSchema);

      if (!validationResult.valid) {
        // pass validation errors to error handler
        //  (the "stack" key is generally the most useful)
        let listOfErrors = validationResult.errors.map((error) => error.stack);
        let error = new ExpressError(listOfErrors, 400);
        return next(error);
      }

      let username = req.params.username;
      delete req.body._token;
      let result = await User.update(username, req.body);

      return res.json({ user: result });
    } catch (err) {
      return next(err);
    }
  });

//delete a company by handle

router.delete("/:username",
  auth.authenticateJWT,
  auth.ensureCorrectUser,
  async function (req, res, next) {
    try {
      let username = req.params.username;
      await User.delete(username);
      return res.json({ message: "User deleted!" });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;
