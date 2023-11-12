const { Schema, model } = require("mongoose");

const postSchema = new Schema({
    id : String,
    username : String,
    password : String,
    desc: String,
})


module.exports = {
    userModel: model("user", postSchema),
}