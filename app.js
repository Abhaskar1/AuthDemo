const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");

const LocalStrategy = require("passport-local");
const User = require("./models/user");

mongoose
  .connect("mongodb://localhost:27017/loginsystem", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB CONNECTED"))
  .catch(() => console.log("Not CONNECTED TO DB"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "RANDOM TEXT HERE",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
var PORT = process.env.PORT || 4001;
app.get("/", function (req, res) {
  res.redirect("/home");
});
app.get("/home", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("signup");
});
app.get("/dashboard", isLoggedIn, function (req, res) {
  res.render("dashboard");
});
app.post("/register", function (req, res) {
  console.log(req.body.firstName);
  console.log(req.body.lastName);
  console.log(req.body.username);
  console.log(req.body.password);
  User.register(
    new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    }),
    req.body.password,
    function (err, user) {
      console.log(user);
      if (err) {
        console.log(err);
      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("/dashboard");
      });
    }
  );
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});
app.listen(PORT, function () {
  console.log(`Server started on ${PORT}`);
});
