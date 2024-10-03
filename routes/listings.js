const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateSchema } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); //initialize multer
//using ../ to access the parent directory

//INDEX ROUTE
//CREATE ROUTE
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateSchema,
  wrapAsync(listingController.createListing)
  // res.send(req.body); //it will give an empty object then use multer package for parsing
  // res.send(req.file);
);

//CATEGORY ROUTE
router.get("/category", wrapAsync(listingController.category));

//SEARCH ROUTE
router.get("/search", wrapAsync(listingController.search));

//PRVIVACY AND SEARCH ROUTES
router.get("/privacy", wrapAsync(listingController.privacy));
router.get("/terms", wrapAsync(listingController.terms));

//NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

//SHOW ROUTE
//UPDATE ROUTE
//DELETE ROUTE
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);
module.exports = router;
