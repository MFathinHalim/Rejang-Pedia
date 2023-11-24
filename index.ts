// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const ejs = require("ejs");
var ImageKit = require("imagekit");

// Importing models for MongoDB
const { mainModel, goingModel, socialModel } = require("./models/post");
const { userModel } = require("./models/user");

// Configuring environment variables
require("dotenv").config();

// Setting up ImageKit
var imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndpoint,
});

// Setting up the server
const server = express();
server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "/public")));
server.set("view options", { compileDebug: false });
server.engine("ejs", (filePath, options, callback) => {
  try {
    const rendered = ejs.renderFile(filePath, options, callback);
    return rendered;
  } catch (error) {
    if (error.message.includes("is not defined")) {
      console.error("Suppressed EJS error:", error.message);
      return "";
    } else {
      throw error;
    }
  }
});

// Using body-parser for JSON and form data
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true,
}));

// Arrays to store data from MongoDB
var dataSocial = []; // Social media data posts
var data = []; // Main data
var dataOnGoing = []; // Ongoing data
var users = []; // Array for users

// Setting up the server to listen on a specific port
const port = 3000;
const uri = process.env.MONGODBURI;

// Connecting to MongoDB
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    // Once connected to MongoDB, start the server
    server.listen(port, () => {
      Host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0";
      console.log(`server is running on port ${port}`);

      // Fetching data from MongoDB collections
      mainModel.find({}, null).then((docs1) => {
        userModel.find({}, null).then((docs) => {
        goingModel.find({}, null).then((docs2) => {
          data = docs1;
          users = docs;
          dataOnGoing = docs2;
          // Importing account router and passing necessary parameters      
          require("./Router/account.js")(server, users, userModel);
          // Importing main router and passing necessary parameters1
          require("./Router/rejangpedia.js")(
            server,
            data,
            mainModel,
            dataOnGoing,
            userModel,
            goingModel,
            imagekit,
            users,
          );
        });
        });
      });

      // Fetching social media data from MongoDB
      socialModel.find({}, null).then((docs) => {
        dataSocial = docs;
        // Importing social media router and passing necessary parameters
        require("./Router/mediaSocial.js")(
          server,
          dataSocial,
          users,
          socialModel,
          imagekit,
        );
      });
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

// Code Made By M.Fathin Halim