const Collection = require("../model/model");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const autho = async function (req, res, next) {
  try {
    const token = req.cookies.jwt;

    if (token != undefined) {
      const verify = jwt.verify(
        token,
        "qwtqeueiwuebcsbnhjgdhgueeoquiruoiejskabmad "
      );
      const user = await Collection.findOne({ id: verify._id });
      req.user = user;
      req.token = token;
      next();
    } else {
      res.render("login");
    }
  } catch (error) {
    res.send(error);
  }
};
module.exports = autho;
