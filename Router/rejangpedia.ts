const multer = require("multer"); // Multer is used for handling file uploads, specifically for images
const axios = require("axios");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs");

module.exports = function (
  server: any,
  data: any[],
  mainModel: any,
  dataOnGoing: any[],
  userModel: any,
  goingModel: any,
  imagekit: any,
  users: any[]
) {
  const discordWebhookURL =
    "https://discord.com/api/webhooks/1180052293928886302/lf7CdjxqlIChndm0e1REE4ZsD_RkAoE7KYolLVrXHg8RpAl2kaMCEuWmw3BBWmJBJddt";
  async function sendDiscordNotification(articleTitle, articleLink) {
    try {
      const response = await axios.post(discordWebhookURL, {
        content: `<@&1177554932786798662>
**Article Baru!**
**Judul:** ${articleTitle}
**Link:** ${articleLink}`,
      });
    } catch (error) {
      console.error("Gagal mengirim notifikasi ke Discord:", error.message);
    }
  }
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
  // Route to get the main page of Rejangpedia
  server.get("/", function (req, res) {
    // Filter data for recommended articles
    var filteredData = data.filter(
      (item) =>
        item.Title.toLowerCase().includes("rejang") ||
        item.Title.toLowerCase().includes("bengkulu")
    );

    const existingData = new Set();
    const combinedData = [];

    for (let i = 0; i < 5; i++) {
      const random = Math.floor(Math.random() * filteredData.length);
      const randomData = filteredData[random];

      combinedData.push(randomData);
      existingData.add(randomData);

      const random2 = Math.floor(Math.random() * data.length);
      const randomData2 = data[random2];

      combinedData.push(randomData2);
      existingData.add(randomData2);
    } // Loop for combined data

    // Split the combined data into dataPilihan and dataAcak
    const dataPilihan = combinedData.slice(0, 3);
    const dataAcak = combinedData.slice(4);

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
  server.get("/details/:id", async function (req, res) {
    try {
      var theData = data.find((obj) => obj.id === req.params.id);

      // Check if the data is undefined
      if (!theData) {
        const apiUrl = `https://id.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${encodeURIComponent(
          req.params.id
        )}&exintro=true&formatversion=2`;

        // Lakukan permintaan ke API Wikipedia
        const response = await axios.get(apiUrl);

        // Ambil data artikel dan gambar dari respons API
        const page = response.data.query.pages[0];
        theData = {
          Title: page.title,
          Content: [{ babContent: page.extract }],
          Image: page.thumbnail?.source.replace("50px", "3000px") || null,
        };
      }
      //https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Art_%26_Culture_-_Rejang_Renteng.jpg/50px-Art_%26_Culture_-_Rejang_Renteng.jpg

      res.render("details", {
        data: theData,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
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
            { $set: { atmin: true } }
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
  server.get("/search", async function (req, res) {
    const searchTerm = req.query.term; // Get the user input
    const searchResultsLocal = data.filter(
      (item) => item.Title.toLowerCase().includes(searchTerm.toLowerCase()) // Search the local data
    );

    const apiUrl = `https://id.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${encodeURIComponent(
      searchTerm
    )}&exintro=true&formatversion=2`;

    try {
      const response = await axios.get(apiUrl);
      const pages = response.data.query.pages;
      if (pages[0].extract != "") {
        // Jika terdapat data yang menyatakan "{data} dapat mengacu pada beberapa hal berikut:"
        if (pages[0].extract.includes("mengacu pada beberapa hal berikut:")) {
          // Ambil daftar judul dari teks yang diberikan
          const titlesText = pages[0].extract;
          const titlesList = titlesText.match(/<li>(.*?)<\/li>/g);

          // Buat permintaan untuk masing-masing judul dan tambahkan ke hasil pencarian
          const additionalResults = [];
          if (titlesList) {
            for (const title of titlesList) {
              const titleText = title.replace(/<\/?[^>]+(>|$)/g, ""); // Hapus tag HTML
              const titleApiUrl = `https://id.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${encodeURIComponent(
                titleText
              )}&exintro=true&formatversion=2`;

              const titleResponse = await axios.get(titleApiUrl);
              const titlePages = titleResponse.data.query.pages;

              // Ambil data artikel dan gambar dari respons API
              const titleData = {
                Title: titlePages[0].title,
                Content: [{ babContent: titlePages[0].extract }],
                Image:
                  titlePages[0].thumbnail?.source.replace("50px", "3000px") ||
                  null,
                Wikipedia: true,
              };
              // Periksa apakah titleData sudah ada di data
              const isTitleDataExists = data.some(
                (item) => item.Title === titleData.Title
              );

              // Jika titleData belum ada di data, tambahkan ke additionalResults
              if (!isTitleDataExists) {
                data.push(titleData);

                // Create a new document in the 'mainModel' collection
                await mainModel.create({
                  id: titleData.Title,
                  Title: titleData.Title,
                  Pembuat: "rejangpedia",
                  Image: titleData.Image,
                  Diedit: "",
                  Link: "",
                  Content: titleData.Content,
                });
                additionalResults.push(titleData);
              }
            }
          }

          // Gabungkan hasil pencarian lokal dan dari Wikipedia
          const searchResults = searchResultsLocal.concat(additionalResults);
          res.render("search-results", {
            results: searchResults,
            searchTerm: searchTerm,
          });
        } else {
          // Jika tidak ada "{data} dapat mengacu pada beberapa hal berikut:", tampilkan hasil biasa
          const articleData = {
            Title: pages[0].title,
            Content: [{ babContent: pages[0].extract }],
            Image: pages[0].thumbnail?.source.replace("50px", "3000px") || null,
            Wikipedia: true,
          };
          const isTitleDataExists = data.some(
            (item) => item.Title === articleData.Title
          );

          // Jika titleData belum ada di data, tambahkan ke additionalResults
          if (!isTitleDataExists) {
            data.push(articleData);

            // Create a new document in the 'mainModel' collection
            await mainModel.create({
              id: articleData.Title,
              Title: articleData.Title,
              Pembuat: "rejangpedia",
              Image: articleData.Image,
              Diedit: "",
              Link: "",
              Content: articleData.Content,
            });
          }
          // Gabungkan hasil pencarian lokal dan dari Wikipedia
          const searchResults = [...searchResultsLocal, articleData];

          res.render("search-results", {
            results: searchResults,
            searchTerm: searchTerm,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data from Wikipedia API:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route to handle editing an article
  server.post("/edit/:id", async function (req, res) {
    const token = req.body["g-recaptcha-response"]; // Get the reCAPTCHA token
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
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
            `public/images/uploads/image-${acceptedData.id}.jpg`
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
        (obj) => obj.id === req.params.id
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
        (obj) => obj.id === req.params.id
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
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
    );
    if (!response.data.success)
      return res.json({ msg: "reCAPTCHA tidak valid" });
    const uniqueFileName = uuidv1(); // Initialize a unique filename using uuidv1
    if (!req.file) {
      const user = req.body; // Get the request body

      // Unshift the data to the 'dataOnGoing' array
      dataOnGoing.unshift({
        id: uniqueFileName,
        Title: user.title,
        Pembuat: user.pembuat,
        Image: "https://wallpapercave.com/wp/wp9637250.jpg",
        Diedit: "",
        Link: user.link.replace("/watch?v=", "/embed/"),
        Content: JSON.parse(user.content),
      });

      // Upload the data to MongoDB using the 'goingModel'
      await goingModel.create({
        id: uniqueFileName,
        Title: user.title,
        Image: "https://wallpapercave.com/wp/wp9637250.jpg",
        Pembuat: user.pembuat,
        Link: user.link.replace("/watch?v=", "/embed/"),
        Content: JSON.parse(user.content),
      });
    }
    sendDiscordNotification(
      req.body.title,
      `https://rejang-pedia.mfathinhalim.repl.co/accept/details/ongoing/${uniqueFileName}`
    );
    res.redirect("/");
  });
};
