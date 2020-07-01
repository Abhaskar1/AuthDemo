const mongoose = require("mongoose");
const passporLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,

  },
});
userSchema.plugin(passporLocalMongoose);
module.exports = mongoose.model("User", userSchema);
