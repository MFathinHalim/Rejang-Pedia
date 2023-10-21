const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  id: String,
  Title: String,
  Image: String,
  Content: [
    {
      babTitle: String,
      babContent: String,
    },
  ],
});

module.exports = {
  mainModel: model("mains", postSchema),
  goingModel: model("ongoings", postSchema),
};
