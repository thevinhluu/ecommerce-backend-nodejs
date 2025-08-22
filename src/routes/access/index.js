"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandlder } = require("../../auth/checkAuth");
const router = express.Router();

// signUp
router.post("/shop/signup", asyncHandlder(accessController.signUp));

module.exports = router;
