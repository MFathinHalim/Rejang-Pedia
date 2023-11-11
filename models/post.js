const { Schema, model } = require("mongoose");

const postSchema = new Schema({
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

const postSchemaSocial = new Schema({
    noteId: String,
    noteName: String,
    noteContent: String,
    like: {
        type: Number,
        default: 0
    },
    color: String,
    comment: [{
        commentId: String,
        commenterName: String,
        commentContent: String
    }],
})


module.exports = {
  mainModel: model("mains", postSchema),
  goingModel: model("ongoings", postSchema),
  socialModel: model("chat", postSchemaSocial),
};
