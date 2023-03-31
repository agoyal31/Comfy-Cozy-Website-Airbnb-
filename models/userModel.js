const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
});

userSchema.pre("save", function (next) {
  let user = this;
  //geenrate a unique salt
  bcryptjs
    .genSalt()
    .then((salt) => {
      //hash (start encrypting the password)
      bcryptjs
        .hash(user.password, salt) //hashing password of particular user using the salt
        .then(hashedPwd => {
          user.password = hashedPwd;
          next(); //callback function that tells mongoose to save and move onto the next one
        })
        .catch(err => {
          console.log(`Error occured while hashing.....${err}`);
        });
    })
    .catch(err => {
      console.log(`Error occured when salting.....${err}`);
    });
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
