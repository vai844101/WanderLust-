const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");

//isLoggedIn Middleware
module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to  create a listing!");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl =  (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//currUser is owner of listing or not 
//Authorization for listings
module.exports.isOwner = async (req, res, next) => {
    let { id  } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.CurrUser._id)) {
        req.flash("error", "You are not owner of this listing");
        return res.redirect(`/listing/${id}`);
    }
    next();
};

//Validate Listing Middleware
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//Validate Review Middleware
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//Authorization for review
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId  } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.CurrUser._id)) {
        req.flash("error", "You are not author of this review");
        return res.redirect(`/listing/${id}`);
    }
    next();
};