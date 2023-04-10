const express = require("express");
const router = express.Router();
const models = require("../models/rentals-ds");
const rentalsModel = require("../models/rentalsModel");
const path = require("path");
var rentalsToBeDisplayed = [];
var tempArr = [];

router.get("/", function (req, res) {
  rentalsModel
    .find()
    .then((ifFound) => {
      rentalsToBeDisplayed = ifFound.map((value) => value.toObject());

      var keepOn = true;

      for (let i = 0; i < rentalsToBeDisplayed.length; i++) {
        let emptyArr = [];
        var tempObj = {};
        var x =
          rentalsToBeDisplayed[i].city + "," + rentalsToBeDisplayed[i].province;
        tempObj.cityProvince = x;
        keepOn = true;

        if (tempArr.length == 0) {
          for (var k = 0; k < rentalsToBeDisplayed.length; k++) {
            if (
              rentalsToBeDisplayed[i].city == rentalsToBeDisplayed[k].city &&
              rentalsToBeDisplayed[i].province ==
                rentalsToBeDisplayed[k].province
            )
              emptyArr.push(rentalsToBeDisplayed[k]);
          }
          tempObj.rentalsToBeDisplayed = emptyArr;
          tempArr.push(tempObj);
        }

        for (let j = 0; j < tempArr.length && keepOn == true; j++) {
          if (
            tempArr.length != 0 &&
            rentalsToBeDisplayed[i].city ==
              tempArr[j].rentalsToBeDisplayed[0].city &&
            rentalsToBeDisplayed[i].province ==
              tempArr[j].rentalsToBeDisplayed[0].province
          ) {
            keepOn = false;
          }
        }
        if (keepOn && tempArr.length != 0) {
          for (var k = 0; k < rentalsToBeDisplayed.length; k++) {
            if (
              rentalsToBeDisplayed[i].city == rentalsToBeDisplayed[k].city &&
              rentalsToBeDisplayed[i].province ==
                rentalsToBeDisplayed[k].province
            )
              emptyArr.push(rentalsToBeDisplayed[k]);
          }
          tempObj.rentalsToBeDisplayed = emptyArr;
          tempArr.push(tempObj);
        }
      }
      res.render("rentals/rentals", {
        distinguishProperty: tempArr,
        title: "Rentals",
      });
    })
    .catch((err) => {
      console.log(`sorry unable to find it.......${err}`);
    });
});

router.get("/list", (req, res) => {
  if (req.session && req.session.user && req.session.isClerk) {
    rentalsModel
      .find()
      .then((ifFound) => {
        rentalsToBeDisplayed = ifFound.map((value) => value.toObject());

        //taken compare function from stack overflow
        //before this applied sort in different ways but did not worked
        function compare(a, b) {
          const firstRental = a.headline.toUpperCase();
          const secondRental = b.headline.toUpperCase();

          let comparison = 0;
          if (firstRental > secondRental) {
            comparison = 1;
          } else if (firstRental < secondRental) {
            comparison = -1;
          }
          return comparison;
        }

        rentalsToBeDisplayed.sort(compare);

        console.log(rentalsToBeDisplayed);

        res.render("rentals/list", {
          rentalsToGroup: rentalsToBeDisplayed,
        });
      })
      .catch((err) => {
        console.log("cannot find" + err);
      });
  } else {
    res.status(401).send("Not authorized to view this page");
  }
});

// rentals/add route get part
router.get("/add", (req, res) => {
  res.render("rentals/add");
});

// rentals/add route post part
router.post("/add", (req, res) => {
  var errStr = {};

  var {
    headline,
    numSleeps,
    numBedrooms,
    numBathrooms,
    pricePerNight,
    city,
    province,
    featuredRental,
  } = req.body;

  if (numSleeps < 0 || numSleeps > 100) {
    errStr.numSleeps = "number of sleep value should be between 0 and 100";
  }

  if (numBathrooms < 0 || numBathrooms > 100) {
    errStr.numBathrooms =
      "number of bathrooms value should be between 0 and 100";
  }
  if (numBedrooms < 0 || numBedrooms > 100) {
    errStr.numBedrooms = "number of bedrooms value should be between 0 and 100";
  }

  if (pricePerNight <= 0.0) {
    errStr.pricePerNight = "price per night value should be greater than 0.00";
  }

  if (Object.keys(errStr).length > 0) {
    res.render("rentals/add", {
      errStr,
    });
  } else {
    var featured;
    // now add the entry to the database.
    var newRentalModel = new rentalsModel({
      headline,
      numSleeps,
      numBedrooms,
      numBathrooms,
      pricePerNight,
      city,
      province,
      featuredRental,
    });

    if (req.body.featuredRental != undefined) {
      featured = true;
    } else {
      featured = false;
    }

    newRentalModel
      .save()
      .then((savedRentalModel) => {
        // model saved
        //  Image
        let uniqueName = `rental-pic-${savedRentalModel._id}${
          path.parse(req.files.imageUrl.name).ext
        }`;

        //copy image data in the images folder inside the assets
        req.files.imageUrl
          .mv(`assets/images/${uniqueName}`)
          .then(() => {
            // update the rental document so that it includes the image URL
            rentalsModel
              .updateMany(
                {
                  _id: savedRentalModel._id,
                },
                {
                  imageUrl: `/images/${uniqueName}`,
                },
                {
                  featuredRental: featured,
                }
              )
              .then(() => {
                console.log("Document updated with new Rental pic");

                res.redirect("/");
              })
              .catch((err) => {
                console.log("Cannot update the db with new file name" + err);
              });
          })
          .catch((err) => {
            console.log("cannot move the image file to save" + err);
          });
      })
      .catch((err) => {
        console.log("Cannot save the model" + err);
      });
  }
});

module.exports = router;
