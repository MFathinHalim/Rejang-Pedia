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
module.exports = function (server, users, userModel) {
    var _this = this;
    // Route to handle user signup
    server.post("/signup", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, username, password, desc, isUsernameTaken;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, username = _a.username, password = _a.password, desc = _a.desc;
                    isUsernameTaken = users.some(function (user) { return user.username === username; });
                    if (isUsernameTaken) {
                        return [2 /*return*/, res.send("Maaf, username tersebut sudah ada. Anda bisa menambahkan angka atau kata lain untuk membuat username Anda unik. <a href='/signup' > Kembali </a>")];
                    }
                    // Add user to MongoDB
                    return [4 /*yield*/, userModel.create({
                            id: username,
                            username: username,
                            password: password,
                            desc: desc,
                            atmin: false,
                        })];
                case 1:
                    // Add user to MongoDB
                    _b.sent();
                    // Add user to local array
                    users.push({
                        id: username,
                        username: username,
                        password: password,
                        desc: desc,
                    });
                    // Redirect to the login page
                    return [2 /*return*/, res.redirect("/login")];
            }
        });
    }); });
    // Route to handle user login
    server.post("/login", function (req, res) {
        var _a = req.body, username = _a.username, password = _a.password;
        // Check if the username and password are correct
        var userIndex = users.findIndex(function (u) { return u.username === username && u.password === password; });
        if (userIndex !== -1) {
            // If credentials are correct, render the success page
            return res.render("success", {
                user: users[userIndex].username,
                id: users[userIndex].id,
                atmin: users[userIndex].atmin,
            });
        }
        else {
            // If credentials are wrong, display an error message
            return res.send("Password Salah");
        }
    });
    // Route to render the login page
    server.get("/login", function (req, res) {
        res.render("login");
    });
    // Route to render the signup page
    server.get("/signup", function (req, res) {
        res.render("signup");
    });
};
