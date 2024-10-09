const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  //geocoding
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 2,
    })
    .send();

  // console.log(response.body.features[0].geometry); 

  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url,"...", filename);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  // console.log(savedListing);
  req.flash("success", "Your listing has been created!"); //flash message
  res.redirect("/listing");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exit!"); //flash message
    res.redirect("/listing");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exit!"); //flash message
    res.redirect("/listing");
  }

  let originalImageUrl = listing.image.url; //image preview in edit form
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); //change image quality/size on clodinary.
  res.render("listings/edit.ejs", { listing, originalImageUrl });

  //   let originalImageUrl = listing.image ? listing.image.url : ''; // Make sure listing.image exists
  // if (originalImageUrl) {
  //     originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  // }
  // res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing);

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }

  req.flash("success", "Your listing has been updated!"); //flash message
  res.redirect(`/listing/${id}`);
  // res.redirect("/listing");
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash("success", "Your listing has been deleted!"); //flash message
  res.redirect("/listing");
};
