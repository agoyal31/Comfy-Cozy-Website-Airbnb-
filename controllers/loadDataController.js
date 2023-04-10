const express = require("express")
const router = express.Router()
const models = require("../models/rentals-ds")
const rentalsModel = require("../models/rentalsModel")
var displayMessage;

router.get("/rentals", (req, res)=> {

    // protect the route so only data clerk can access it

    if (req.session && req.session.user && req.session.isClerk){

        rentalsModel.count()
        .then(display=> {
            if (display){
                console.log("Properties exists in rentals")
                displayMessage = "Documents already loaded from the Database";
                res.render("load-data/rentals", {
                    title: "Rentals", 
                    displayMessage
                })
            }
            else{
                console.log("No properties exists in Database.")
                rentalsModel.insertMany(models.rentalsArray)
                .then(() => {
                    displayMessage = "Rental properties are added to the database"
                    res.render("load-data/rentals", {
                        title: "Rentals", 
                        displayMessage
                    })
                })
                .catch((err)=> {
                    console.log(`encounter some problem while adding rentals....${err}`)
                })
            }
        }).catch(err => {
            console.log("Couldn't display rentals......" + err);
        })
    }
    else{
        res.status(401).send("You are Not authorized to view this page")
    }
})

module.exports = router;