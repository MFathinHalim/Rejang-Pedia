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

// Using body-parser for JSON and form data
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

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
  .then(async () => {
    // Fetching data from MongoDB collections
    const [docs1, docs, docs2] = await Promise.all([
      mainModel.find({}, null),
      userModel.find({}, null),
      goingModel.find({}, null),
    ]);

    data = docs1;
    users = docs;
    dataOnGoing = docs2;

    // Fetching social media data from MongoDB
    const socialDocs = await socialModel.find({}, null);
    dataSocial = socialDocs;

    // Importing routers and passing necessary parameters
    require("./Router/account.js")(server, users, userModel);
    require("./Router/rejangpedia.js")(
      server,
      data,
      mainModel,
      dataOnGoing,
      userModel,
      goingModel,
      imagekit,
      users
    );
    require("./Router/mediaSocial.js")(
      server,
      dataSocial,
      users,
      socialModel,
      imagekit
    );

    // Middleware for handling 404
    server.use((req, res) => {
      res.status(404).render("not-found");
    });

    // Start the server
    server.listen(port, () => {
      const host =
        process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0";
      console.log(`Server is running on ${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
