"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialModel = exports.goingModel = exports.mainModel = void 0;
var mongoose_1 = require("mongoose");
var postSchema = new mongoose_1.Schema({
    id: String,
    Title: String,
    Image: String,
    Pembuat: String,
    Diedit: String,
    Link: String,
    Content: [
        {
            babTitle: String,
            babContent: String,
        },
    ],
});
var postSchemaSocial = new mongoose_1.Schema({
    noteId: String,
    noteName: String,
    noteContent: String,
    like: {
        type: Number,
        default: 0,
    },
    color: String,
    comment: [
        {
            commentId: String,
            commenterName: String,
            commentContent: String,
        },
    ],
});
exports.mainModel = (0, mongoose_1.model)("mains", postSchema);
exports.goingModel = (0, mongoose_1.model)("ongoings", postSchema);
exports.socialModel = (0, mongoose_1.model)("chat", postSchemaSocial);
