const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    userName: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  })

  UserModel=mongoose.model("user",UserSchema);

  module.exports=UserModel;
