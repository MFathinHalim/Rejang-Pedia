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
var multer = require("multer"); // Multer is used for handling file uploads, specifically for images
var axios = require("axios");
var uuidv1 = require("uuid").v1;
var path = require("path");
var fs = require("fs");
module.exports = function (server, data, mainModel, dataOnGoing, userModel, goingModel, imagekit, users) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "public/images/uploads");
        },
        filename: function (req, file, cb) {
            return __awaiter(this, void 0, void 0, function () {
                var uniqueFileName, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            uniqueFileName = uuidv1();
                            user = req.body;
                            // Unshift the data to the 'dataOnGoing' array
                            dataOnGoing.unshift({
                                id: uniqueFileName,
                                Title: user.title,
                                Pembuat: user.pembuat,
                                Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
                                    uniqueFileName +
                                    ".jpg",
                                Diedit: "",
                                Link: user.link.replace("/watch?v=", "/embed/"),
                                Content: JSON.parse(user.content),
                            });
                            // Upload the data to MongoDB using the 'goingModel'
                            return [4 /*yield*/, goingModel.create({
                                    id: uniqueFileName,
                                    Title: user.title,
                                    Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
                                        uniqueFileName +
                                        ".jpg",
                                    Pembuat: user.pembuat,
                                    Link: user.link.replace("/watch?v=", "/embed/"),
                                    Content: JSON.parse(user.content),
                                })];
                        case 1:
                            // Upload the data to MongoDB using the 'goingModel'
                            _a.sent();
                            // Use uuidv1 to create a unique file name for the image
                            cb(null, "image-".concat(uniqueFileName, ".jpg"));
                            return [2 /*return*/];
                    }
                });
            });
        },
    });
    // After the storage is configured, initialize the upload function
    var upload = multer({ storage: storage }); // Middleware for handling article uploads
    // Route to get the main page of Rejangpedia
    server.get("/", function (req, res) {
        // Filter data for recommended articles
        var filteredData = data.filter(function (item) {
            return item.Title.toLowerCase().includes("rejang") ||
                item.Title.toLowerCase().includes("bengkulu");
        });
        var existingData = new Set();
        var dataPilihan = [];
        var dataAcak = [];
        for (var i = 0; i < 3; i++) {
            var random = Math.floor(Math.random() * filteredData.length);
            var randomData = filteredData[random];
            if (!existingData.has(randomData)) {
                dataPilihan.push(randomData);
                existingData.add(randomData);
            }
        } // Loop for recommended data
        var existingDataPilihan = new Set(dataPilihan);
        for (var i = 0; i < 3; i++) {
            var random2 = Math.floor(Math.random() * data.length);
            var randomData2 = data[random2];
            if (!existingData.has(randomData2) &&
                !existingDataPilihan.has(randomData2)) {
                dataAcak.push(randomData2);
            }
        } // Loop for very random data
        res.render("home", {
            data: filteredData,
            dataPilihan: dataPilihan,
            dataAcak: dataAcak,
        });
    });
    // Route to render the 'new' page for creating a new article
    server.get("/new", function (req, res) {
        res.render("new");
    });
    // Route to render the 'peraturan' (regulation) page
    server.get("/peraturan", function (req, res) {
        res.render("peraturan");
    });
    // Route to render the 'tentang' (about) page
    server.get("/tentang", function (req, res) {
        res.render("tentang");
    });
    // Route to render the 'dropdown' page
    server.get("/dropdown", function (req, res) {
        res.render("dropdown");
    });
    // Route to render the article details page
    server.get("/details/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var theData;
            return __generator(this, function (_a) {
                try {
                    theData = data.find(function (obj) { return obj.id === req.params.id; });
                    // Check if the data is undefined
                    if (!theData) {
                        return [2 /*return*/, res.send("Data tidak ditemukan")];
                    }
                    res.render("details", {
                        data: theData,
                    });
                }
                catch (error) {
                    console.error("Error fetching data:", error);
                    res.status(500).send("Internal Server Error");
                }
                return [2 /*return*/];
            });
        });
    });
    // Route to render the ongoing article details page
    server.get("/details/ongoing/:id", function (req, res) {
        var theData = dataOnGoing.find(function (obj) { return obj.id === req.params.id; });
        // Check if the data is null
        if (theData === null) {
            res.send("Data tidak ditemukan");
        }
        res.render("details", {
            data: theData,
        });
    });
    // Route to render the 'rekrutatmin' (recruit admin) page
    server.get("/rekrutatmin", function (req, res) {
        res.render("recrut", {
            data: users,
        });
    });
    // Route to process the recruitment of admin
    server.get("/admin-new/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, foundUser, foundUserServer, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, userModel.findOne({ id: userId })];
                    case 2:
                        foundUser = _a.sent();
                        foundUserServer = users.find(function (user) { return user.id === userId; });
                        if (!foundUser) return [3 /*break*/, 5];
                        if (!!foundUser.atmin) return [3 /*break*/, 4];
                        return [4 /*yield*/, userModel.updateOne({ _id: foundUser._id }, { $set: { atmin: true } })];
                    case 3:
                        _a.sent();
                        foundUserServer.atmin = true;
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        res.status(404).send("User dengan ID ".concat(userId, " tidak ditemukan."));
                        _a.label = 6;
                    case 6:
                        res.redirect("/rekrutatmin");
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error("Terjadi kesalahan:", error_1);
                        res.status(500).send("Terjadi kesalahan server.");
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    });
    // Route to render the 'edit' page for editing an article
    server.get("/edit/:id", function (req, res) {
        var theData = data.find(function (obj) { return obj.id === req.params.id; });
        // Check if the data is null
        if (theData === null) {
            res.send("Data tidak ditemukan");
        }
        res.render("edit", {
            data: theData,
        });
    });
    // Route to handle searching for articles
    server.get("/search", function (req, res) {
        var searchTerm = req.query.term; // Get the user input
        var searchResults = data.filter(function (item) { return item.Title.toLowerCase().includes(searchTerm.toLowerCase()); } // Search the data
        );
        res.render("search-results", {
            results: searchResults,
            searchTerm: searchTerm,
        });
    });
    // Route to handle editing an article
    server.post("/edit/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, acceptedData, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = req.body["g-recaptcha-response"];
                        return [4 /*yield*/, axios.post("https://www.google.com/recaptcha/api/siteverify?secret=".concat(process.env.GOOGLE_RECAPTCHA_SECRET_KEY, "&response=").concat(token))];
                    case 1:
                        response = _a.sent();
                        if (!response.data.success)
                            return [2 /*return*/, res.json({ msg: "reCAPTCHA tidak valid" })];
                        acceptedData = data.find(function (obj) { return obj.id === req.params.id; });
                        user = req.body;
                        if (!(acceptedData.Pembuat !== null)) return [3 /*break*/, 3];
                        // If the article maker is not empty
                        dataOnGoing.unshift({
                            id: req.params.id,
                            Title: user.title,
                            Pembuat: acceptedData.Pembuat,
                            Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
                                req.params.id +
                                ".jpg",
                            Diedit: user.pembuat,
                            Link: user.link.replace("/watch?v=", "/embed/"),
                            Content: JSON.parse(user.content),
                        });
                        return [4 /*yield*/, goingModel.create({
                                id: req.params.id,
                                Title: user.title,
                                Pembuat: acceptedData.Pembuat,
                                Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
                                    req.params.id +
                                    ".jpg",
                                Diedit: user.pembuat,
                                Link: user.link.replace("/watch?v=", "/embed/"),
                                Content: JSON.parse(user.content),
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        dataOnGoing.unshift({
                            id: req.params.id,
                            Title: user.title,
                            Pembuat: "Anonymous",
                            Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
                                req.params.id +
                                ".jpg",
                            Diedit: user.pembuat,
                            Link: user.link.replace("/watch?v=", "/embed/"),
                            Content: JSON.parse(user.content),
                        });
                        return [4 /*yield*/, goingModel.create({
                                id: req.params.id,
                                Title: user.title,
                                Pembuat: "Anonymous",
                                Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
                                    req.params.id +
                                    ".jpg",
                                Diedit: user.pembuat,
                                Link: user.link.replace("/watch?v=", "/embed/"),
                                Content: JSON.parse(user.content),
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        res.redirect("/");
                        return [2 /*return*/];
                }
            });
        });
    });
    // Route to handle deleting an article
    server.get("/delete/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                data = data.filter(function (obj) { return obj.id !== req.params.id; }); // Filter the data
                // Delete the article from the 'mainModel'
                mainModel
                    .deleteOne({ id: req.params.id })
                    .then(function () {
                    console.log("deleted"); // Success
                })
                    .catch(function (error) {
                    console.log(error); // Failure
                });
                res.redirect("/accept");
                return [2 /*return*/];
            });
        });
    });
    // Route to handle deleting an ongoing article
    server.get("/accept/delete/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                dataOnGoing = dataOnGoing.filter(function (obj) { return obj.id !== req.params.id; }); // Filter the data
                // Delete the ongoing article from the 'goingModel'
                goingModel
                    .deleteOne({ id: req.params.id })
                    .then(function () {
                    console.log("deleted"); // Success
                })
                    .catch(function (error) {
                    console.log(error); // Failure
                });
                res.redirect("/accept");
                return [2 /*return*/];
            });
        });
    });
    // Route to accept the ongoing article and move it to the main data
    server.get("/accept/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var acceptedData, uploadResponse, filePath, existingDataIndex, error_2, existingDataIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acceptedData = dataOnGoing.find(function (obj) { return obj.id === req.params.id; });
                        if (!acceptedData) {
                            res.send("Data not found");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 15]);
                        if (!acceptedData.Image) return [3 /*break*/, 3];
                        return [4 /*yield*/, imagekit.upload({
                                file: fs.readFileSync("public/images/uploads/image-".concat(acceptedData.id, ".jpg")),
                                fileName: "image-".concat(acceptedData.id, ".jpg"),
                                folder: "/RejangPedia",
                                useUniqueFileName: false,
                            })];
                    case 2:
                        uploadResponse = _a.sent();
                        // Delete the local image file after it is uploaded to ImageKit
                        if (uploadResponse && uploadResponse.success) {
                            filePath = "public/images/uploads/image-".concat(acceptedData.id, ".jpg");
                            fs.unlink(filePath, function (err) {
                                if (err) {
                                    console.error("Gagal menghapus gambar lokal:", err);
                                }
                            });
                        }
                        _a.label = 3;
                    case 3:
                        existingDataIndex = data.findIndex(function (obj) { return obj.id === req.params.id; });
                        // Delete the ongoing article from the 'goingModel'
                        return [4 /*yield*/, goingModel.deleteOne({ id: req.params.id })];
                    case 4:
                        // Delete the ongoing article from the 'goingModel'
                        _a.sent();
                        if (!(existingDataIndex !== -1)) return [3 /*break*/, 6];
                        data[existingDataIndex] = acceptedData;
                        return [4 /*yield*/, mainModel.findOneAndUpdate({ id: req.params.id }, acceptedData)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        data.push(acceptedData);
                        // Create a new document in the 'mainModel' collection
                        return [4 /*yield*/, mainModel.create({
                                id: acceptedData.id,
                                Title: acceptedData.Title,
                                Pembuat: acceptedData.Pembuat,
                                Image: acceptedData.Image,
                                Diedit: "",
                                Link: acceptedData.Link,
                                Content: acceptedData.Content,
                            })];
                    case 7:
                        // Create a new document in the 'mainModel' collection
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        // Remove the ongoing article from the 'dataOnGoing' array
                        dataOnGoing = dataOnGoing.filter(function (obj) { return obj.id !== req.params.id; });
                        // Render the 'ongoing' page with the updated data
                        res.render("ongoing", {
                            data: dataOnGoing,
                            dataUtama: data,
                        });
                        return [3 /*break*/, 15];
                    case 9:
                        error_2 = _a.sent();
                        existingDataIndex = data.findIndex(function (obj) { return obj.id === req.params.id; });
                        if (!(existingDataIndex !== -1)) return [3 /*break*/, 11];
                        data[existingDataIndex] = acceptedData;
                        return [4 /*yield*/, mainModel.findOneAndUpdate({ id: req.params.id }, acceptedData)];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 11:
                        data.push(acceptedData);
                        // Create a new document in the 'mainModel' collection
                        return [4 /*yield*/, mainModel.create({
                                id: acceptedData.id,
                                Title: acceptedData.Title,
                                Pembuat: acceptedData.Pembuat,
                                Image: acceptedData.Image,
                                Diedit: "",
                                Content: acceptedData.Content,
                                Link: acceptedData.Link,
                            })];
                    case 12:
                        // Create a new document in the 'mainModel' collection
                        _a.sent();
                        // Delete the ongoing article from the 'goingModel'
                        return [4 /*yield*/, goingModel.deleteOne({ id: req.params.id })];
                    case 13:
                        // Delete the ongoing article from the 'goingModel'
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        // Remove the ongoing article from the 'dataOnGoing' array
                        dataOnGoing = dataOnGoing.filter(function (obj) { return obj.id !== req.params.id; });
                        // Redirect to the 'accept' page
                        res.redirect("/accept");
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    });
    // Route to render the 'accept' page with ongoing articles
    server.get("/accept/", function (req, res) {
        res.render("ongoing", {
            data: dataOnGoing,
            dataUtama: data,
        });
    });
    // Route to render the 'data' page with all articles
    server.get("/data/", function (req, res) {
        res.render("data", {
            data: data,
        });
    });
    // Route to handle the creation of a new article
    server.post("/new", upload.single("image"), function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, uniqueFileName, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = req.body["g-recaptcha-response"];
                        return [4 /*yield*/, axios.post("https://www.google.com/recaptcha/api/siteverify?secret=".concat(process.env.GOOGLE_RECAPTCHA_SECRET_KEY, "&response=").concat(token))];
                    case 1:
                        response = _a.sent();
                        if (!response.data.success)
                            return [2 /*return*/, res.json({ msg: "reCAPTCHA tidak valid" })];
                        if (!!req.file) return [3 /*break*/, 3];
                        uniqueFileName = uuidv1();
                        user = req.body;
                        // Unshift the data to the 'dataOnGoing' array
                        dataOnGoing.unshift({
                            id: uniqueFileName,
                            Title: user.title,
                            Pembuat: user.pembuat,
                            Image: "https://wallpapercave.com/wp/wp9637250.jpg",
                            Diedit: "",
                            Link: user.link.replace("/watch?v=", "/embed/"),
                            Content: JSON.parse(user.content),
                        });
                        // Upload the data to MongoDB using the 'goingModel'
                        return [4 /*yield*/, goingModel.create({
                                id: uniqueFileName,
                                Title: user.title,
                                Image: "https://wallpapercave.com/wp/wp9637250.jpg",
                                Pembuat: user.pembuat,
                                Link: user.link.replace("/watch?v=", "/embed/"),
                                Content: JSON.parse(user.content),
                            })];
                    case 2:
                        // Upload the data to MongoDB using the 'goingModel'
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        res.redirect("/");
                        return [2 /*return*/];
                }
            });
        });
    });
};
