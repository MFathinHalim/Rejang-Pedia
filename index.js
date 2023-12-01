var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// Importing required modules
var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var session = require("express-session");
var mongoose = require("mongoose");
var path = require("path");
var ejs = require("ejs");
var ImageKit = require("imagekit");
// Importing models for MongoDB
var _a = require("./models/post"), mainModel = _a.mainModel, goingModel = _a.goingModel, socialModel = _a.socialModel;
var userModel = require("./models/user").userModel;
// Configuring environment variables
require("dotenv").config();
// Setting up ImageKit
var imagekit = new ImageKit({
    publicKey: process.env.publicImg,
    privateKey: process.env.privateImg,
    urlEndpoint: process.env.urlEndpoint,
});
// Setting up the server
var server = express();
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
var port = 3000;
var uri = process.env.MONGODBURI || "";
// Connecting to MongoDB
mongoose
    .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
    .then(function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, docs1, docs, docs2, socialDocs;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    mainModel.find({}, null),
                    userModel.find({}, null),
                    goingModel.find({}, null),
                ])];
            case 1:
                _a = _b.sent(), docs1 = _a[0], docs = _a[1], docs2 = _a[2];
                data = docs1;
                users = docs;
                dataOnGoing = docs2;
                return [4 /*yield*/, socialModel.find({}, null)];
            case 2:
                socialDocs = _b.sent();
                dataSocial = socialDocs;
                // Importing routers and passing necessary parameters
                require("./Router/account.js")(server, users, userModel);
                require("./Router/rejangpedia.js")(server, data, mainModel, dataOnGoing, userModel, goingModel, imagekit, users);
                require("./Router/mediaSocial.js")(server, dataSocial, users, socialModel, imagekit, userModel);
                // Middleware for handling 404
                server.use(function (req, res) {
                    res.status(404).render("not-found");
                });
                // Start the server
                server.listen(port, function () {
                    var host = process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0";
                    console.log("Server is running on ".concat(host, ":").concat(port));
                });
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (error) {
    console.error("Database connection error:", error);
});
