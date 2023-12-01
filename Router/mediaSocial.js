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
var multer = require("multer");
var axios = require("axios");
var uuidv1 = require("uuid").v1;
var path = require("path");
var fs = require("fs");
module.exports = function (server, dataSocial, users, socialModel, imagekit, userModel) {
    var _this = this;
    var model = socialModel;
    var storageSocial = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "public/images/uploads");
        },
        filename: function (req, file, cb) {
            cb(null, "image-".concat(dataSocial.length + 100, ".jpg"));
        },
    });
    var uploadSocial = multer({ storage: storageSocial });
    server.get("/page/:pageNumber", function (req, res) {
        res.render("social", {
            data: dataSocial,
        });
    });
    server.get("/chat", function (req, res) {
        res.render("social", {
            data: dataSocial,
        });
    });
    server.get("/chat/share/:noteId", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var noteIdGet, itemIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        noteIdGet = req.params.noteId.trim();
                        return [4 /*yield*/, dataSocial.findIndex(function (_a) {
                                var noteId = _a.noteId;
                                return noteId == noteIdGet;
                            })];
                    case 1:
                        itemIndex = _a.sent();
                        res.render("detailsSocial", {
                            element: dataSocial[itemIndex],
                        });
                        return [2 /*return*/];
                }
            });
        });
    });
    server.get("/chat/:noteId", function (req, res) {
        var usernameToFind = req.params.noteId.trim();
        var user = users.find(function (_a) {
            var username = _a.username, id = _a.id;
            return id === usernameToFind || username === usernameToFind;
        });
        if (user) {
            var matchingItems = dataSocial.filter(function (_a) {
                var noteName = _a.noteName;
                return noteName === user.id || noteName === usernameToFind;
            });
            res.render("user", {
                data: matchingItems,
                userData: user,
            });
        }
        else {
            res.status(404).send("User not found");
        }
    });
    server.post("/chat", uploadSocial.single("image"), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var token, response, noteContent, noteName, noteId, file, ext, imageFileName, imageFilePath, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = req.body["g-recaptcha-response"];
                    return [4 /*yield*/, axios.post("https://www.google.com/recaptcha/api/siteverify?secret=".concat(process.env.GOOGLE_RECAPTCHA_SECRET_KEY, "&response=").concat(token))];
                case 1:
                    response = _a.sent();
                    if (!response.data.success)
                        return [2 /*return*/, res.json({ msg: "reCAPTCHA tidak valid" })];
                    noteContent = req.body.noteContent;
                    noteName = req.body.noteName;
                    noteId = uuidv1();
                    file = req.file;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    if (!(noteContent.trim() !== "" && noteName.trim() !== "")) return [3 /*break*/, 4];
                    return [4 /*yield*/, model.create({
                            noteContent: noteContent,
                            noteName: noteName,
                            noteId: noteId,
                            comment: [],
                            like: 0,
                        })];
                case 3:
                    _a.sent();
                    dataSocial.unshift({
                        noteId: noteId,
                        noteContent: noteContent,
                        noteName: noteName,
                        like: 0,
                        comment: [],
                    });
                    _a.label = 4;
                case 4:
                    if (file) {
                        ext = file.filename.split(".")[file.filename.split(".").length - 1];
                        fs.readFile(path.join(__dirname, "/public/images/uploads", "image-" + (dataSocial.length + 99) + ".jpg"), function (err, data) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (err)
                                                throw err;
                                            return [4 /*yield*/, imagekit.upload({
                                                    file: data,
                                                    fileName: "image-" + noteId + ".jpg",
                                                    folder: "/RejangConnection",
                                                    useUniqueFileName: false,
                                                }, function (error, result) {
                                                    if (error)
                                                        console.log(error);
                                                    else
                                                        console.log(result);
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        imageFileName = "image-".concat(dataSocial.length + 99, ".jpg");
                        imageFilePath = path.join(__dirname, "/public/images/uploads", imageFileName);
                        if (fs.existsSync(imageFilePath)) {
                            fs.unlinkSync(imageFilePath);
                        }
                    }
                    res.redirect("/chat/share/" + noteId);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.error(err_1);
                    res.redirect("/chat");
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    server.post("/chat/comment/:noteId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var commentContent, commenterName, noteIdPost, commentID, itemIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commentContent = req.body.commentContent;
                    commenterName = req.body.commenterName;
                    noteIdPost = req.params.noteId;
                    commentID = dataSocial.length + 50;
                    itemIndex = dataSocial.findIndex(function (_a) {
                        var noteId = _a.noteId;
                        return noteId == noteIdPost;
                    });
                    return [4 /*yield*/, socialModel.findOneAndUpdate({ noteId: noteIdPost }, {
                            $push: {
                                comment: { commentContent: commentContent, commentId: commentID, commenterName: commenterName },
                            },
                        })];
                case 1:
                    _a.sent();
                    if (itemIndex !== -1) {
                        dataSocial[itemIndex].comment.push({
                            commentID: commentID,
                            commenterName: commenterName,
                            commentContent: commentContent,
                        });
                        res.redirect("/chat/share/" + noteIdPost);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    server.get("/edit-profile/:id", function (req, res) {
        var acceptedData = users.findIndex(function (obj) { return obj.id === req.params.id; });
        res.render("profile-edit", {
            data: users[acceptedData],
        });
    });
    server.post("/edit-profile/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var acceptedData, user, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    acceptedData = users.findIndex(function (obj) { return obj.id === req.params.id; });
                    user = req.body;
                    if (!(user.password === users[acceptedData].password)) return [3 /*break*/, 2];
                    users[acceptedData].username = user.username;
                    users[acceptedData].password = user.password;
                    users[acceptedData].desc = user.desc;
                    return [4 /*yield*/, userModel.findOneAndUpdate({ id: req.params.id }, { $set: user }, { new: true })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    res.redirect("/chat/".concat(req.params.id));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error(error_1);
                    res.status(500).send("Internal Server Error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
};
