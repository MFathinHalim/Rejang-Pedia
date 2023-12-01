"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
var mongoose_1 = require("mongoose");
var postSchema = new mongoose_1.Schema({
    id: String,
    username: String,
    password: String,
    desc: String,
    atmin: Boolean,
});
exports.userModel = (0, mongoose_1.model)("user", postSchema);
