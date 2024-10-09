if(process.env.NODE_ENV != "production"){
    require('dotenv').config();//require dotenv package
}

//require package
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema} = require("./schema.js");
// const Review = require("./models/review.js");
// const {reviewSchema} = require("./schema.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport =  require("passport");
const LocalStrategy = require("passport-local");
const  User = require("./models/user.js");
// const {isLoggedIn, isOwner, isReviewAuthor} = require("./middleware.js");
// const { saveRedirectUrl } = require("./middleware.js");



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require('console');

//const mongoDB_URL = 'mongodb://127.0.0.1:27017/wanderlust';

const dbUrl = process.env.ATLASDB_URL;

//call main function
main().then((result) => {
    console.log("connected to database");
}).catch((err) => {
    console.error(err);
});
//database connection
async function main(){
    await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


//mongo session store -- session related data store in atlas db like login/logout by default session expires in 14 days.
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60, //session-- for long update -- in secs
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", error);
});

//Expresss Session
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() + 7 * 24 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 1000,
        httpOnly: true,
    },
  };


//Session middleware 
app.use(session(sessionOptions));
//flash middleware
app.use(flash());

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//locals middleware for define local variable
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.CurrUser = req.user; //currently logged in user
    next();
});

//Demo user Route(create a user)

// app.get("/demouser", async(req,res) => {
//   let fakeUser = new User ({
//     email: "vaibhav123@gmail.com",
//     username: "vai@123",
//   });

// let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

//SignUp User --GET
// app.get("/signup", (req, res) => {
//     res.render("users/signup.ejs");
// });

//SignUp User  Route--POST
// app.post("/signup", wrapAsync(async (req, res) => {
//     try {
//       let { username, email, password} = req.body;
//       const newUser = new User({ email, username });
//       const registeredUser = await 
//       User.register(newUser, password);
//       console.log(registeredUser);
//       //automatically login after  sign up
//       req.login(registeredUser , (err)=> {
//         if(err){ 
//             return next(err);
//         }
//       req.flash("success", "Welcome to Wanderlust!");
//       res.redirect("/listing");  
//       }); 
//     } 
//     catch(err){
//         req.flash("error", err.message);
//         res.redirect("/signup");
//     }
  
// }));

//Login User Route--GET
// app.get('/login', (req, res) =>{
//  res.render("users/login.ejs");
// });

//Login User -- POST
// app.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), 
// async(req, res) => {
//    req.flash("success", "Welcome to Wonderlust! You are logged in!");
//    let redirectUrl = res.locals.redirectUrl || "/listing";
//    res.redirect(redirectUrl);
// });

//Logout user
// app.get("/logout", (req, res, next) => {
//     req.logout((err) => {
//         if (err) {
//             return next(err);
//         }
//         req.flash("success", "you are logged out!");
//         res.redirect("/listing");
//     });
// });

//api 
// app.get("/", (req, res) => {
//     res.send("Hello World!" );
// });

//Validate Listing Middleware
// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };

//Validate Review Middleware
// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "Wonderful mountain sight",
//         description: "This is a wonderful view of the mountains.",
//         price: 5000,
//         location: "kashmir",
//         country: "India",
// });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// //index route
// app.get("/listing", wrapAsync(async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", {allListings});
// }));

// //New Route
// app.get("/listing/new", isLoggedIn ,(req, res) => {
//     res.render('listings/new.ejs');
// });
// // isLoggedIn is middleware

// //create Route
// app.post("/listing",validateListing, isLoggedIn, wrapAsync(async (req, res, next) => {
//     const newListing =  new 
//     Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     await newListing.save();
//     req.flash("success","Your listing has been created!");//flash message
//     res.redirect("/listing");
// }));

// //show route
// app.get("/listing/:id", wrapAsync(async(req, res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id)
//     .populate({
//         path: "reviews", 
//         populate: {
//             path: "author",
//         },
//     })
//         .populate("owner");
//     if(!listing) {
//         req.flash("error","Listing you requested for does not exit!");//flash message 
//         res.redirect("/listing");
//     }
//     // console.log(listing);
//     res.render("listings/show.ejs", {listing});
// }));

// //edit route
// app.get('/listing/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req,res)=> {
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//     if(!listing) {
//         req.flash("error","Listing you requested for does not exit!");//flash message 
//         res.redirect("/listing");
//     }
//     res.render("listings/edit.ejs", {listing});
// }));

// //update route
// app.put('/listing/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req,res) =>{
//     let {id} = req.params;
//     const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing);
//     req.flash("success","Your listing has been updated!");//flash message
//     res.redirect(`/listing/${id}`);
//     // res.redirect("/listing");
// }));

// //delete route
// app.delete('/listing/:id', isLoggedIn, isOwner, wrapAsync(async (req,res) =>{
//     let {id} = req.params;
//     let deletedListing = await 
//     Listing.findByIdAndDelete(id);
//     // console.log(deletedListing);
//     req.flash("success","Your listing has been deleted!");//flash message
//     res.redirect('/listing');
// }));

app.use("/listing", listingRouter);
app.use("/listing/:id/reviews", reviewRouter);
app.use("/", userRouter);

// //Reviews
// //Post Reviews Route
// app.post("/listing/:id/reviews", isLoggedIn, validateReview, wrapAsync(async(req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     newReview.author = req.user._id;

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();
//     req.flash("success","New Review created!");//flash message

//     // console.log("new review saved");
//     // res.send("new review saved");
//     res.redirect(`/listing/${listing._id}`);
// }));

// //Delete Review Route
// app.delete("/listing/:id/reviews/:reviewId" , isLoggedIn, isReviewAuthor, wrapAsync(async (req , res) => {
//     let { id, reviewId } = req.params;

//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
//     await Review.findByIdAndDelete(reviewId)
    
//     req.flash("success","Review has been deleted!");//flash message
//     res.redirect(`/listing/${id}`);
// }));

//Send standard Error response if route or page is not found or match.
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

//Custom Epress Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode=500, message = "Something went Wrong!" } = err; //deconstruct
    res.status(statusCode).render("error.ejs", { message }); //for error.ejs
    // res.status(statusCode).send(message);
    // res.send("Something went to wrong!");
});



//start server on 8080
app.listen(8080, () => {
   console.log("Server is listening to port 8080");
});

