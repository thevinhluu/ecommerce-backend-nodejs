"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandlder = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

const router = express.Router();

// signUp
router.post("/shop/signup", asyncHandlder(accessController.signUp));
router.post("/shop/login", asyncHandlder(accessController.login));

// authentication //
router.use(authenticationV2);
/////////////////////
router.post("/shop/logout", asyncHandlder(accessController.logout));
router.post(
  "/shop/handlerRefreshToken",
  asyncHandlder(accessController.handlerRefreshToken)
);

module.exports = router;
