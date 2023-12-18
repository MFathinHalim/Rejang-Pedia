const multer = require("multer");
const axios = require("axios");
const { v1: uuidv1 } = require("uuid");
import * as path from "path";
const fs = require("fs");

module.exports = function (
  server,
  dataSocial,
  users,
  socialModel,
  imagekit,
  userModel
) {
  var model = socialModel;
  const storageSocial = multer.memoryStorage();

  const uploadSocial = multer({ storage: storageSocial });
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

  server.get("/chat/share/:noteId", async function (req, res) {
    const noteIdGet = req.params.noteId.trim();
    const itemIndex = await dataSocial.findIndex(
      ({ noteId }) => noteId == noteIdGet
    );

    res.render("detailsSocial", {
      element: dataSocial[itemIndex],
    });
  });

  server.get("/chat/:noteId", function (req, res) {
    const usernameToFind = req.params.noteId.trim();

    const user = users.find(
      ({ username, id }) => id === usernameToFind || username === usernameToFind
    );

    if (user) {
      const matchingItems = dataSocial.filter(
        ({ noteName }) => noteName === user.id || noteName === usernameToFind
      );

      res.render("user", {
        data: matchingItems,
        userData: user,
      });
    } else {
      res.status(404).send("User not found");
    }
  });

  server.post("/chat", uploadSocial.single("image"), async (req, res) => {
    const token = req.body["g-recaptcha-response"];
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
    );

    if (!response.data.success)
      return res.json({ msg: "reCAPTCHA tidak valid" });

    const noteContent = req.body.noteContent;
    const noteName = req.body.noteName;
    const noteId = uuidv1();
    const file = req.file.buffer;

    try {
      if (noteContent.trim() !== "" && noteName.trim() !== "") {
        await model.create({
          noteContent,
          noteName,
          noteId,
          comment: [],
          like: 0,
        });

        dataSocial.unshift({
          noteId,
          noteContent,
          noteName,
          like: 0,
          comment: [],
        });
      }

      if (req.file) {
        await imagekit.upload(
          {
            file: file,
            fileName: "image-" + noteId + ".jpg",
            folder: "/RejangConnection",
            useUniqueFileName: false,
          },
          function (error, result) {
            if (error) console.log(error);
            else console.log(result);
          }
        );
      }

      res.redirect("/chat/share/" + noteId);
    } catch (err) {
      console.error(err);
      res.redirect("/chat");
    }
  });

  server.post("/chat/comment/:noteId", async (req, res) => {
    const commentContent = req.body.commentContent;
    const commenterName = req.body.commenterName;
    const noteIdPost = req.params.noteId;
    const commentID = dataSocial.length + 50;
    const itemIndex = dataSocial.findIndex(
      ({ noteId }) => noteId == noteIdPost
    );

    await socialModel.findOneAndUpdate(
      { noteId: noteIdPost },
      {
        $push: {
          comment: { commentContent, commentId: commentID, commenterName },
        },
      }
    );

    if (itemIndex !== -1) {
      dataSocial[itemIndex].comment.push({
        commentID,
        commenterName,
        commentContent,
      });
      res.redirect("/chat/share/" + noteIdPost);
    }
  });

  server.get("/edit-profile/:id", (req, res) => {
    const acceptedData = users.findIndex((obj) => obj.id === req.params.id);
    res.render("profile-edit", {
      data: users[acceptedData],
    });
  });

  server.post("/edit-profile/:id", async (req, res) => {
    try {
      const acceptedData = users.findIndex((obj) => obj.id === req.params.id);
      const user = req.body;

      if (user.password === users[acceptedData].password) {
        users[acceptedData].username = user.username;
        users[acceptedData].password = user.password;
        users[acceptedData].desc = user.desc;

        await userModel.findOneAndUpdate(
          { id: req.params.id },
          { $set: user },
          { new: true }
        );
      }

      res.redirect(`/chat/${req.params.id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
};
