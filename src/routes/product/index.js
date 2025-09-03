"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandlder = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandlder(productController.getListSearchProduct)
);
router.get("", asyncHandlder(productController.findAllProducts));
router.get("/:product_id", asyncHandlder(productController.findProduct));

// authentication //
router.use(authenticationV2);
/////////////////////
router.post("", asyncHandlder(productController.createProduct));
router.post(
  "/publish/:id",
  asyncHandlder(productController.publishProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandlder(productController.unPublishProductByShop)
);

// QUERY //

router.get("/drafts/all", asyncHandlder(productController.getAllDraftsForShop));
router.get(
  "/published/all",
  asyncHandlder(productController.getAllPublishForShop)
);
router.get(
  "/published/all",
  asyncHandlder(productController.getAllPublishForShop)
);

module.exports = router;
