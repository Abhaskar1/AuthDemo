const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const Task = require("./models/task");
const methodOverride = require("method-override")
app.use(methodOverride("_method"))
//mongoose
mongoose
  .connect("mongodb://localhost:27017/loginsystem", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB CONNECTED"))
  .catch(() => console.log("Not CONNECTED TO DB"));
app.use(bodyParser.urlencoded({ extended: true }));
//express session
app.use(
  require("express-session")({
    secret: "RANDOM TEXT HERE",
    resave: false,
    saveUninitialized: false,
  })
);
mongoose.set('useFindAndModify', false);
//initialisations
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set("view engine", "ejs");
app.use(express.static("public"));
//currentUser
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
//port
var PORT = process.env.PORT || 4000;
//home
app.get("/", function (req, res) {
  res.redirect("/home");
});
//home
app.get("/home", function (req, res) {
  res.render("home");
});
//show login form
app.get("/login", function (req, res) {
  res.render("login");
});
//show register form
app.get("/register", function (req, res) {
  res.render("signup");
});


//show dashboard
app.get("/dashboard", isLoggedIn, function (req, res) {
  const tasks = Task.find({}, function (err, tasks) {
    if (err) {
      console.log("HERE " + err)
      res.redirect("back")

    }
    else {
      // console.log("TASKS ARE " + tasks)
      res.render("dashboard", { tasks: tasks });

    }
  })
});
//sign up logic
app.post("/register", function (req, res) {
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
        res.redirect("back")

      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("/dashboard");
      });
    }
  );
});
//login logic
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),
  function (req, res) { }
);
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
//logout
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});
//new task
app.post("/add", function (req, res) {
  const author = {
    id: req.user._id,
    username: req.user.username
  }
  const newTask = new Task({
    title: req.body.title,
    description: req.body.description,
    author: author
  })
  Task.create(newTask, function (err, createdTask) {
    if (err) {
      console.log(err)
      res.redirect("back")

    }
    else {
      //console.log(createdTask)
      res.redirect("/dashboard")
    }
  })
})
//edit task
app.put("/add/:id", function (req, res) {
  const data = { title: req.body.title, description: req.body.description }
  Task.findByIdAndUpdate(req.params.id, data, function (err, updatedTask) {
    if (err || !updatedTask) {

      console.log(err)
      res.redirect("back")

    }
    else {
      res.redirect("/dashboard")
    }
  })

})
//show 
app.get("/show/:id", isLoggedIn, function (req, res) {
  //console.log(req.params.id)
  Task.findById(req.params.id, function (err, foundTask) {
    if (err || !foundTask) {
      console.log(err)
      res.redirect("back")
    }
    else {
      res.render("show", { task: foundTask })
    }
  })
})

//edit from
app.get("/edit/:id", isLoggedIn, function (req, res) {
  Task.findById(req.params.id, function (err, foundTask) {
    if (err || !foundTask) {
      console.log(err)
      res.redirect("back")

    }
    else {
      res.render("edit", { task: foundTask })
    }
  })

})
//delete
app.delete("/delete/:id", isLoggedIn, function (req, res) {

  Task.findByIdAndDelete(req.params.id, function (err) {
    if (err) {
      console.log(err)
      res.redirect("back")

    }
    else {
      res.redirect("/dashboard")
    }
  })
})

//ADD FLASH MESSEGES

//listen
app.listen(PORT, function () {
  console.log(`Server started on ${PORT}`);
});
