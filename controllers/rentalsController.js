const express = require("express");
const router = express.Router();
const models = require("../models/rentals-ds");

router.get("/",(req,res)=>{
    res.render("rentals/rentals",{
        distinguishProperty: models.getRentalsByCityAndProvince()
    });
});

router.get("/list",(req,res)=>{
    if (req.session.isClerk){
        res.render("rentals/list");
    }
    else{
        res.status(401).send("Not authorized to view this page");
    }
})

module.exports = router;