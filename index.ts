// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
import * as path from "path";
const ejs = require("ejs");
var ImageKit = require("imagekit");
const cors = require("cors"); // Import the CORS middleware

// Importing models for MongoDB
const { mainModel, goingModel, socialModel } = require("./models/post");
const { userModel } = require("./models/user");

// Configuring environment variables
require("dotenv").config();

// Setting up ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndpoint,
});

// Setting up the server
const server = express();
server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "/public")));

// Using body-parser for JSON and form data
server.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Arrays to store data from MongoDB
let dataSocial: Document[] = []; // Social media data posts
let data: Document[] = []; // Main data
let dataOnGoing: Document[] = []; // Ongoing data
let users: Document[] = []; // Array for users

// Setting up the server to listen on a specific port
const port: number = 3000;
const uri: string = process.env.MONGODBURI || "";

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
      imagekit,
      userModel
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
