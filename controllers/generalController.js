const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const models = require("../models/rentals-ds");
const validation = require("../models/validation");
const userModel = require("../models/userModel");
const rentalsModel = require("../models/rentalModel");
var username;
var totalBeforeTax = 0;
var valueAddedTax = 0;
var total = 0;

router.get("/", (req, res) => {
  rentalsModel
    .find({
      featuredRental: true,
    })
    .then((foundRental) => {
      if (foundRental) {
        console.log("found the rentals" + foundRental);
        let featuredRentalsHome = foundRental.map((value) => value.toObject());
        res.render("general/home", {
          rentalProperty: featuredRentalsHome,
        });
      } else {
        console.log("No featured rentals found from the rentals list");
      }
    })
    .catch((err) => {
      console.log(
        `Cannot try to find the rentals to display on homepage ${err}`
      );
    });
});

router.get("/sign-up", (req, res) => {
  res.render("general/sign-up");
});

router.get("/log-in", (req, res) => {
  res.render("general/log-in");
});

router.get("/welcome", (req, res) => {
  res.render("general/welcome", {
    data: username,
  });
});

router.post("/sign-up", (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password } = req.body;
  username = req.body.firstName;
  const { passedValidation, validationMessage } =
    validation.registrationValidation({ firstName, lastName, email, password });
  if (passedValidation) {
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password,
    });

    newUser
      .save()
      .then((userSaved) => {
        console.log(`Saved ${userSaved.firstName}`);

        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
        const msg = {
          to: req.body.email,
          from: "avnigoel113@gmail.com",
          subject: "Registration Confirmation at Comfy&Cozy",
          html: `Hello ${req.body.firstName}, Thank you for Registration at Comfy&Cozy. I am Avni, here to welcome you and wishing good luck for your stay or booking. I am here for further assistance, feel free to reach out to me.`,
        };
        sgMail
          .send(msg)
          .then(() => {
            res.redirect("/welcome");
          })
          .catch((err) => {
            console.log(err);
            res.render("general/sign-up", {
              title: "sign-up",
              toDisplayValidationMessage: validationMessage,
              values: req.body,
            });
          });
      })
      .catch((err) => {
        console.log("Cannot save to the DB");
        if (Object.keys(err.keyValue) == "email") {
          console.log(err.keyValue);
          res.render("general/sign-up", {
            title: "sign-up",
            errors: "Please enter different email address.",
            values: req.body,
          });
        } else {
          res.render("general/sign-up", {
            title: "sign-up",
            errors: "Something went wrong!",
            values: req.body,
          });
        }
      });
  } else {
    res.render("general/sign-up", {
      title: "sign-up",
      toDisplayValidationMessage: validationMessage,
      values: req.body,
    });
  }
});

router.post("/log-in", (req, res) => {
  const { email, password } = req.body;
  const { isValid, validateMessage } = validation.loginValidation({
    email,
    password,
  });
  if (isValid) {
    // ToDo: Validate the form information
    let errors = [];

    // search MongoDB for a document with matching email address.
    userModel
      .findOne({
        email: req.body.email,
      })
      .then((user) => {
        // Completed the search and now cheking if the returned user is empty or have something in it
        if (user) {
          // find the user document
          // compare the passwd by the user with one stored in the document
          bcrypt.compare(req.body.password, user.password).then((isMatched) => {
            // done comparing the passwords
            // now we want to log them in --------------
            if (isMatched) {
              // Passwords matches
              // Create a new session by storing the user document to the session
              req.session.user = user;

              if ((req.session.isClerk = req.body.selected === "Clerk")) {
                res.redirect("rentals/list");
              } 
              if 
                ((req.session.isCustomer = req.body.selected === "Customer")){
                  req.session.cart = [];
                res.redirect("/cart");
              }
              //res.redirect("/welcome");
            } else {
              // passwords are different
              console.log("passwords do not match");
              errors.push("Please enter the correct password.");

              res.render("general/log-in", {
                errors,
              });
            }
          });
        } else {
          // user document is not found in the collection
          console.log("user not found in DB");
          errors.push("Please enter a valid email");
          res.render("general/log-in", {
            errors,
          });
        }
      })
      .catch((err) => {
        // Couldn't query the database.
        console.log("Error finding the user in the db...." + err);
        errors.push("something went wrong");

        res.render("general/log-in", {
          errors,
        });
      });
  } else {
    res.render("general/log-in", {
      title: "log-in",
      printMessages: validateMessage,
      values: req.body,
    });
  }
});

router.get("/cart", (req, res) => {
  if (req.session.user) {
    if (!req.session.isClerk) {
      res.render("general/cart");
    } else {
      res.status(401).send("Not Authorized to view this page");
    }
  } else {
    res.status(401).send("Not Authorized to view this page");
  }
});

router.get("/logout", (req, res) => {
  //clear the session from the memory
  req.session.destroy();
  res.redirect("/log-in");
});

// rent route for the cart
router.get("/rent/:rentalId", (req, res) => {
  var isPresent = false;
  var rentID = req.params.rentalId;
  var cart = req.session.cart || [];

  rentalsModel
    .findOne({ _id: rentID })
    .lean()
    .then((propFound) => {

      cart.forEach((eachProp) => {
        if (eachProp.id == rentID) {
          eachProp.numberOfNights++;
          eachProp.priceOfStay = eachProp.priceOfStay * eachProp.numberOfNights;
          isPresent = true;
        }
      });

      if (isPresent) {
        console.log("Cart Updated");

      } else {
        
        cart.push({
          id: rentID,
          numberOfNights: 1,
          priceOfStay: propFound.pricePerNight,
          propFound,
        });

        console.log("rendering to the cart page.");
      }

      totalBeforeTax = 0;

      cart.forEach((allRentals) => {
        totalBeforeTax = totalBeforeTax + allRentals.priceOfStay;
        valueAddedTax = totalBeforeTax * 0.1;
        total = totalBeforeTax + valueAddedTax;
      });

      res.render("general/cart", {
        title: "Cart",
        addedCart: cart,
        totalBeforeTax: totalBeforeTax.toFixed(2),
        valueAddedTax: valueAddedTax.toFixed(2),
        total: total.toFixed(2),
      });
    })
    .catch((err) => {
      console.log("Cannot search in the db" + err);
    });
});

router.get("/remove/:rentalId", (req, res) => {
  var rentID = req.params.rentalId;
  var cart = req.session.cart || [];

  const positionIndex = cart.findIndex((rental) => rental.id == rentID);

  if (positionIndex >= 0) {
    displayMsg = `Rental "${cart[positionIndex].propFound.headline}" is removed.`;

    totalBeforeTax -= cart[positionIndex].priceOfStay;
    valueAddedTax = totalBeforeTax * 0.1;
    total = totalBeforeTax + valueAddedTax;

    cart.splice(positionIndex, 1);
  } else {
    displayMsg = "Error finding rentals in the cart";
  }

  res.render("general/cart", {
    title: "Cart",
    addedCart: cart,
    totalBeforeTax: totalBeforeTax.toFixed(2),
    valueAddedTax: valueAddedTax.toFixed(2),
    total: total.toFixed(2),
  });
});

router.get("/place-order", (req, res) => {
  console.log("Emptying cart");


  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

  const msg = {
    to: req.session.user.email,
    from: "avnigoel113@gmail.com",
    subject: "Checkout Summary",
    html: `Hello ${req.session.user.firstname}, Thank you for choosing Cozy And Comfy. Hope you will enjoy your stay with us and make it most memorable one`
  };

  //emptying the cart here
  req.session.cart = [];

  sgMail
    .send(msg)
    .then(() => {
      console.log("Rendering to home page");
      res.redirect("/");
    })

    .catch((err) => {
      console.log(err);
      res.render("general/cart", {
        title: "cart",
      });
    });
});

module.exports = router;
