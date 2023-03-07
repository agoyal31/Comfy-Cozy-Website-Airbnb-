/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Avni Goyal
* Student ID    : 166795211
* Course/Section: WEB322 NCC
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const models = require("./models/view/rentals-ds")
const validation = require("./models/view/validation")
const exphbs = require("express-handlebars"); 
//set up dot env
const dotenv = require("dotenv");
dotenv.config({path:"./dotenv/sendgridKey.env"});
const app = express();

// Set up Handlebars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main"
}));
app.set("view engine", ".hbs");

//set up body parser
app.use(express.urlencoded({ extended: false }));

// Set up "assets" folder so it is public.
app.use(express.static(path.join(__dirname, "/assets")));

// Add your routes here
// e.g. app.get() { ... }
// app.get("/", function(req,res){
//     res.sendFile(path.join(__dirname, "/views/homePage.html"));
// });

app.get("/",(req,res)=>{
    res.render("home", {
      rentalProperty: models.getFeaturedRentals()
    });
});

app.get("/sign-up",(req,res)=>{
    res.render("sign-up");
});

app.get("/log-in",(req,res)=>{
    res.render("log-in");
});

app.get("/rentals",(req,res)=>{
    res.render("rentals",{
        distinguishProperty: models.getRentalsByCityAndProvince()
    });
});
/////////////////////////////////////////////////////////////////////////////////
app.post("/sign-up", (req, res) => {
    console.log(req.body);
    //amended
    const { firstName, lastName, email, password } = req.body;
    //   res.render("sign-up",{
    //      title:"sign-up"
    //     });
    //amended
    //const {firstName,lastName,email,password} = req.body;
    const { passedValidation, validationMessage } =
      validation.registrationValidation({ firstName, lastName, email, password });
    // console.log(passedValidation);
    if (passedValidation){
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
         const msg = {
          to: req.body.email,
          from: "avnigoel113@gmail.com",
          subject: "Registration Confirmation at Comfy&Cozy",
          html: `Hello ${req.body.firstName}, Thank you for Registration at Comfy&Cozy. I am Avni, here to welcome you and wishing good luck for your stay or booking. I am here for further assistance, feel free to reach out to me.`,
        };
        sgMail.send(msg)
          .then(() => {
            res.render("welcome", {
              title: "welcome Page",
            });
            // res.send("success,validation passed and email has been sent!")
          })
          .catch((err) => {
            console.log(err);
            res.render("sign-up", {
              title: "sign-up",
              toDisplayValidationMessage: validationMessage,
              values: req.body,
            });
          });
    }
    else {
        res.render("sign-up", {
          title: "sign-up",
          toDisplayValidationMessage: validationMessage,
          values: req.body,
        });
      }
});


app.post("/log-in", (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    const { isValid, validateMessage } = validation.loginValidation({
      email,
      password,
    });
    if (isValid) {
      res.render("welcome", {
        title: "welcome Page",
      });
    } else {
      res.render("log-in", {
        title: "log-in",
        printMessages: validateMessage,
        values: req.body,
      });
    }
  });

// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);