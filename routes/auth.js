const express = require('express');
const router = new express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const ExpressError = require("../helpers/expressError.js");
const User = require("../models/user.js");

router.post("/login", async function(req,res,next){
  try{
    let {username,password} = req.body;
    let authenticated = await User.authenticate(username,password);
    if(authenticated){
      let adminCheck = await User.getIsAdmin(username);
      let token = await jwt.sign({
        username,
        is_admin:adminCheck.is_admin
      },
      SECRET_KEY);
      
      return res.json({token});
    } else {
      throw new ExpressError("incorrect username/password",401);
    }
  }
  catch(err){
    return next(err);
  }
 

})

module.exports = router;

