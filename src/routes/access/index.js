"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandlder = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");

const router = express.Router();

// signUp
router.post("/shop/signup", asyncHandlder(accessController.signUp));
router.post("/shop/login", asyncHandlder(accessController.login));

// authentication //
router.use(authentication);
/////////////////////
router.post("/shop/logout", asyncHandlder(accessController.logout));

module.exports = router;
