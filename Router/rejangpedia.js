const multer = require("multer"); // Multer is used for handling file uploads, specifically for images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads");
  },
  filename: async function (req, file, cb) {
    const uniqueFileName = uuidv1(); // Initialize a unique filename using uuidv1
    const user = req.body; // Get the request body

    // Unshift the data to the 'dataOnGoing' array
    dataOnGoing.unshift({
      id: uniqueFileName,
      Title: user.title,
      Pembuat: user.pembuat,
      Image:
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg",
      Diedit: "",
      Link: user.link.replace("/watch?v=", "/embed/"),
      Content: JSON.parse(user.content),
    });

    // Upload the data to MongoDB using the 'goingModel'
    await goingModel.create({
      id: uniqueFileName,
      Title: user.title,
      Image:
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg",
      Pembuat: user.pembuat,
      Link: user.link.replace("/watch?v=", "/embed/"),
      Content: JSON.parse(user.content),
    });

    // Use uuidv1 to create a unique file name for the image
    cb(null, `image-${uniqueFileName}.jpg`);
  },
});

// After the storage is configured, initialize the upload function
const upload = multer({ storage: storage }); // Middleware for handling article uploads

module.exports = function (
  server,
  data,
  mainModel,
  dataOnGoing,
  userModel,
  goingModel,
  imagekit,
) {
  // Route to get the main page of Rejangpedia
  server.get("/", function (req, res) {
    // Filter data for recommended articles
    var filteredData = data.filter(
      (item) =>
        item.Title.toLowerCase().includes("rejang") ||
        item.Title.toLowerCase().includes("bengkulu"),
    );

    const existingData = new Set();
    const dataPilihan = [];
    const dataAcak = [];

    for (i = 0; i < 3; i++) {
      const random = Math.floor(Math.random() * filteredData.length);
      const randomData = filteredData[random];

      if (!existingData.has(randomData)) {
        dataPilihan.push(randomData);
        existingData.add(randomData);
      }
    } // Loop for recommended data

    const existingDataPilihan = new Set(dataPilihan);
    for (i = 0; i < 3; i++) {
      const random2 = Math.floor(Math.random() * data.length);
      const randomData2 = data[random2];

      if (
        !existingData.has(randomData2) &&
        !existingDataPilihan.has(randomData2)
      ) {
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
    const theData = data.find((obj) => obj.id === req.params.id);
    // Check if the data is null
    if (theData === null) {
      res.send("Data tidak ditemukan");
    }
    res.render("details", {
      data: theData,
    });
  });

  // Route to render the ongoing article details page
  server.get("/details/ongoing/:id", function (req, res) {
    const theData = dataOnGoing.find((obj) => obj.id === req.params.id);
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
  server.get("/admin-new/:id", async function (req, res) {
    const userId = req.params.id;

    try {
      // Find the user with the matching id
      const foundUser = await userModel.findOne({ id: userId });
      const foundUserServer = users.find((user) => user.id === userId);

      if (foundUser) {
        // If the user is found, set the 'atmin' property to true
        if (!foundUser.atmin) {
          await userModel.updateOne(
            { _id: foundUser._id },
            { $set: { atmin: true } },
          );
          foundUserServer.atmin = true;
        }
      } else {
        res.status(404).send(`User dengan ID ${userId} tidak ditemukan.`);
      }
      res.redirect("/rekrutatmin");
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      res.status(500).send("Terjadi kesalahan server.");
    }
  });

  // Route to render the 'edit' page for editing an article
  server.get("/edit/:id", function (req, res) {
    const theData = data.find((obj) => obj.id === req.params.id);
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
    const searchTerm = req.query.term; // Get the user input
    const searchResults = data.filter(
      (item) => item.Title.toLowerCase().includes(searchTerm.toLowerCase()), // Search the data
    );
    res.render("search-results", {
      results: searchResults,
      searchTerm: searchTerm,
    });
  });

  // Route to handle editing an article
  server.post("/edit/:id", async function (req, res) {
    const token = req.body["g-recaptcha-response"]; // Get the reCAPTCHA token
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`,
    ); // Send an axios request for the token
    if (!response.data.success)
      return res.json({ msg: "reCAPTCHA tidak valid" });

    const acceptedData = data.find((obj) => obj.id === req.params.id);
    const user = req.body;

    if (acceptedData.Pembuat !== null) {
      // If the article maker is not empty
      dataOnGoing.unshift({
        id: req.params.id,
        Title: user.title,
        Pembuat: acceptedData.Pembuat,
        Image:
          "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
          req.params.id +
          ".jpg",
        Diedit: user.pembuat,
        Link: user.link.replace("/watch?v=", "/embed/"),
        Content: JSON.parse(user.content),
      });
      await goingModel.create({
        id: req.params.id,
        Title: user.title,
        Pembuat: acceptedData.Pembuat,
        Image:
          "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
          req.params.id +
          ".jpg",
        Diedit: user.pembuat,
        Link: user.link.replace("/watch?v=", "/embed/"),
        Content: JSON.parse(user.content),
      });
    } else {
      dataOnGoing.unshift({
        id: req.params.id,
        Title: user.title,
        Pembuat: "Anonymous",
        Image:
          "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
          req.params.id +
          ".jpg",
        Diedit: user.pembuat,
        Link: user.link.replace("/watch?v=", "/embed/"),
        Content: JSON.parse(user.content),
      });
      await goingModel.create({
        id: req.params.id,
        Title: user.title,
        Pembuat: "Anonymous",
        Image:
          "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
          req.params.id +
          ".jpg",
        Diedit: user.pembuat,
        Link: user.link.replace("/watch?v=", "/embed/"),
        Content: JSON.parse(user.content),
      });
    }

    res.redirect("/");
  });

  // Route to handle deleting an article
  server.get("/delete/:id", async function (req, res) {
    data = data.filter((obj) => obj.id !== req.params.id); // Filter the data
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
  });

  // Route to handle deleting an ongoing article
  server.get("/accept/delete/:id", async function (req, res) {
    dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id); // Filter the data
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
  });

  // Route to accept the ongoing article and move it to the main data
  server.get("/accept/:id", async function (req, res) {
    const acceptedData = dataOnGoing.find((obj) => obj.id === req.params.id);

    if (!acceptedData) {
      res.send("Data not found");
      return;
    }

    try {
      // Upload the image to ImageKit if it exists
      if (acceptedData.Image) {
        const uploadResponse = await imagekit.upload({
          file: fs.readFileSync(
            `public/images/uploads/image-${acceptedData.id}.jpg`,
          ),
          fileName: `image-${acceptedData.id}.jpg`,
          folder: "/RejangPedia",
          useUniqueFileName: false,
        });

        // Delete the local image file after it is uploaded to ImageKit
        if (uploadResponse && uploadResponse.success) {
          const filePath = `public/images/uploads/image-${acceptedData.id}.jpg`;
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Gagal menghapus gambar lokal:", err);
            }
          });
        }
      }

      // Find the index of the ongoing article in the 'data' array
      const existingDataIndex = data.findIndex(
        (obj) => obj.id === req.params.id,
      );

      // Delete the ongoing article from the 'goingModel'
      await goingModel.deleteOne({ id: req.params.id });

      // Update or create the data in the 'data' array
      if (existingDataIndex !== -1) {
        data[existingDataIndex] = acceptedData;
        await mainModel.findOneAndUpdate({ id: req.params.id }, acceptedData);
      } else {
        data.push(acceptedData);

        // Create a new document in the 'mainModel' collection
        await mainModel.create({
          id: acceptedData.id,
          Title: acceptedData.Title,
          Pembuat: acceptedData.Pembuat,
          Image: acceptedData.Image,
          Diedit: "",
          Link: acceptedData.Link,
          Content: acceptedData.Content,
        });
      }

      // Remove the ongoing article from the 'dataOnGoing' array
      dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);

      // Render the 'ongoing' page with the updated data
      res.render("ongoing", {
        data: dataOnGoing,
        dataUtama: data,
      });
    } catch (error) {
      // Check if the ongoing article with that ID already exists in 'data'
      const existingDataIndex = data.findIndex(
        (obj) => obj.id === req.params.id,
      );

      // Update or create the data in the 'data' array
      if (existingDataIndex !== -1) {
        data[existingDataIndex] = acceptedData;
        await mainModel.findOneAndUpdate({ id: req.params.id }, acceptedData);
      } else {
        data.push(acceptedData);

        // Create a new document in the 'mainModel' collection
        await mainModel.create({
          id: acceptedData.id,
          Title: acceptedData.Title,
          Pembuat: acceptedData.Pembuat,
          Image: acceptedData.Image,
          Diedit: "",
          Content: acceptedData.Content,
          Link: acceptedData.Link,
        });

        // Delete the ongoing article from the 'goingModel'
        await goingModel.deleteOne({ id: req.params.id });
      }

      // Remove the ongoing article from the 'dataOnGoing' array
      dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);

      // Redirect to the 'accept' page
      res.redirect("/accept");
    }
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
  server.post("/new", upload.single("image"), async function (req, res) {
    const token = req.body["g-recaptcha-response"];
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`,
    );
    if (!response.data.success)
      return res.json({ msg: "reCAPTCHA tidak valid" });

    res.redirect("/");
  });
};
