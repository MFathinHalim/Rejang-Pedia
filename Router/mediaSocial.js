const multer = require("multer"); // Multer is used for file uploads, specifically for images

// Storage configuration for multer for social media posts
const storageSocial = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/images/uploads`);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `image-${data.length + 100}.jpg`,
    ); /* Generate a filename for the uploaded image using the current data length */
  },
});

const uploadSocial = multer({ storage: storageSocial }); // Middleware for handling social media image uploads
module.exports = function (server, dataSocial, users, socialModel, imagekit) {
  // Social Media app

  // Route to render the social media page with paginated data
  server.get("/page/:pageNumber", function (req, res) {
    res.render("social", {
      data: dataSocial,
    });
  });

  // Route to render the chat page
  server.get("/chat", function (req, res) {
    res.render("social", {
      data: dataSocial,
    });
  });

  // Route for sharing a specific post
  server.get("/chat/share/:noteId", function (req, res) {
    const noteIdGet = req.params.noteId.trim();
    const itemIndex = dataSocial.findIndex(({ noteId }) => noteId == noteIdGet); // Find the index of the post

    res.render("detailsSocial", {
      element: dataSocial[itemIndex],
    });
  });

  // Route for user details
  server.get("/chat/:noteId", function (req, res) {
    const usernameToFind = req.params.noteId.trim();

    // Find the user in the users array based on the username
    const user = users.find(
      ({ username, id }) =>
        id === usernameToFind || username === usernameToFind,
    );

    if (user) {
      // If the user is found, use their id to filter dataSocial
      const matchingItems = dataSocial.filter(
        ({ noteName }) => noteName === user.id || noteName === usernameToFind,
      );

      res.render("user", {
        data: matchingItems,
        userData: user,
      });
    } else {
      // Handle the case where the user is not found
      res.status(404).send("User not found");
    }
  });

  // Route for adding a new social media post
  server.post("/chat", uploadSocial.single("image"), async (req, res) => {
    // Verify Google reCAPTCHA response
    const token = req.body["g-recaptcha-response"];
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`,
    );

    if (!response.data.success)
      return res.json({ msg: "reCAPTCHA tidak valid" });

    // Extracting data from the request
    const noteContent = req.body.noteContent;
    const noteName = req.body.noteName;
    const noteId = uuidv1();
    const file = req.file;

    try {
      if (noteContent.trim() !== "" && noteName.trim() !== "") {
        // Add the post to the database
        await model.create({
          noteContent,
          noteName,
          noteId,
          color,
          comment: [],
          like: 0,
        });

        // Update the local data array
        data.unshift({
          noteId,
          noteContent,
          noteName,
          like: 0,
          comment: [],
          color,
        });
      }

      // Handle uploaded image
      if (file) {
        // Process the uploaded image and upload it to ImageKit CDN
        // (Code for reading and uploading the image is incomplete in the provided code)
      }
    } catch (err) {
      console.error(err);
    }
    res.redirect("/chat");
  });

  // Route for adding a new comment to a post
  server.post("/chat/comment/:noteId", async (req, res) => {
    // Extracting data from the request
    const commentContent = req.body.commentContent;
    const commenterName = req.body.commenterName;
    const noteIdPost = req.params.noteId;
    const commentID = dataSocial.length + 50;
    const itemIndex = dataSocial.findIndex(
      ({ noteId }) => noteId == noteIdPost,
    );

    // Update the database with the new comment
    await socialModel.findOneAndUpdate(
      { noteId: noteIdPost },
      {
        $push: {
          comment: { commentContent, commentId: commentID, commenterName },
        },
      },
    );

    if (itemIndex !== -1) {
      // Update the local data array
      dataSocial[itemIndex].comment.push({
        commentID,
        commenterName,
        commentContent,
      });
      res.redirect("/chat/share/" + noteIdPost);
    }
  });

  // Route for editing user profile
  server.get("/edit-profile/:id", (req, res) => {
    // Find the user based on the id
    const acceptedData = users.findIndex((obj) => obj.id === req.params.id);
    res.render("profile-edit", {
      data: users[acceptedData],
    });
  });

  // Route for processing the edited user profile
  server.post("/edit-profile/:id", async (req, res) => {
    try {
      // Edit Profile functionality
      const acceptedData = users.findIndex((obj) => obj.id === req.params.id);
      const user = req.body;

      // Check if the provided password matches the user's current password
      if (user.password === users[acceptedData].password) {
        // Update user data
        users[acceptedData].username = user.username;
        users[acceptedData].password = user.password;
        users[acceptedData].desc = user.desc;

        // Update the user profile in the database
        await userModel.findOneAndUpdate(
          { id: req.params.id },
          { $set: user }, // Use $set to update the fields
          { new: true }, // Return the updated document
        );
      }

      res.redirect(`/chat/${req.params.id}`);
    } catch (error) {
      // Handle errors appropriately
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
};
