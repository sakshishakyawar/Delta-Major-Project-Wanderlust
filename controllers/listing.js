const { serializeUser } = require("passport");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const mapToken = process.env.MAP_TOKEN;
// const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let currUser = req.user;
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings, currUser });
};

module.exports.renderNewForm = (req, res) => {
  // console.log(req.user);

  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params; //parsing required
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } }) //nested populate
    .populate("owner"); //want the info of reviews
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // let response = await geoCodingClient
  //   .forwardGeocode({
  //     query: req.body.listing.location,
  //     limit: 1,
  //   })
  //  .send();
  // console.log(response.body.feature[0].geometry);
  // res.send("done")

  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url, " ", filename);

  let listing = req.body.listing;
  const newListing = new Listing(listing);
  newListing.owner = req.user._id; //storing new username of new user
  newListing.image = { url, filename };

  // newListing.geometry = response.body.feature[0].geometry; -> storing cordinates

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params; //parsing required
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(404, "Send valid data for listing");
  }
  let { id } = req.params;
  // console.log(id);
  let updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  }); // deconstructing object

  console.log(req.file);

  if (typeof req.file !== "undefined") {
    //check file value is undefined or not
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
module.exports.category = async (req, res) => {
  const { category } = req.query;
  // console.log(category);
  let listingCategory = await Listing.find({ category: category });
  // console.log(listingCategory);
  if (listingCategory.length === 0) {
    req.flash("error", "Category Does not exists");
    res.redirect("/listings");
  }

  res.render("listings/category.ejs", { listingCategory });
};

module.exports.search = async (req, res) => {
  const { destination } = req.query;
  let searchedListing = await Listing.find({
    $or: [
      { title: destination },
      { location: destination },
      { country: destination },
    ],
  });
  if (searchedListing.length === 0) {
    req.flash("error", "Please search title,location or country");
    res.redirect("/listings");
  }
  res.render("listings/search.ejs", { searchedListing });
};

module.exports.privacy = async (req, res) => {
  res.render("listings/privacy.ejs");
};
module.exports.terms = async (req, res) => {
  res.render("listings/terms.ejs");
};
