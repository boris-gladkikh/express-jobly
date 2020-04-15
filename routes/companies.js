const express = require('express');
const router = new express.Router();
const ExpressError = require("../helpers/expressError.js");
const jsonschema = require("jsonschema");
const Company = require("../models/company.js");


//get companies

router.get("/", async function(req,res,next){
  try{
    let search = req.query.search;
    let min_employees = req.query.min_employees;
    let max_employees = req.query.max_employees;
    let result = await Company.getAll(search,min_employees,max_employees)
    return res.json({companies:result});
  }
  catch(err){
    return next(err)
  }
})


//create new company post route 

router.post("/", async function(req,res,next)  {
  try{
    let {handle, name, num_employees, description, logo_url} = req.body;
  let result = await Company.create(handle, name, num_employees, description, logo_url);
  return res.json({company: result});
  }
  catch(err) {
    return next(err);
  }
  
});

//get company by handle

router.get("/:handle", async function(req, res, next) {
  try{
    let handle = req.params.handle;
    let result = await Company.get(handle);
    return res.json({company:result})

  }
  catch(err){
    return next(err)
  }

});

//partially update a company specified by the handle

router.patch("/:handle", async function(req,res, next) {
  try{
    let handle = req.params.handle;
    let result = await Company.update(handle,req.body);
    return res.json({company:result});
  }
  catch(err){
    return next(err)
  }
});

//delete a company by handle

router.delete("/:handle", async function(req, res,next){
  try{
    let handle = req.params.handle;
    let result = await Company.delete(handle);
    return res.json({message:"Company deleted!"});

  }
  catch(err){

  }
})





module.exports = router