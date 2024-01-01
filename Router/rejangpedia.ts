const multer = require("multer"); // Multer is used for handling file uploads, specifically for images
const axios = require("axios");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs");
//const OpenAI = require("openai");
//const openai = new OpenAI({
//  apiKey: "",
//});

class TreeNode {
  data: any;
  left: any;
  right: any;
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

type Data = {
  id: string;
  Title: string;
  Image: string;
  Pembuat: string;
  Diedit: string;
  Link: string;
  Content: {
    babTitle: string;
    babContent: string;
  }[];
};

type Users = {
  id: string;
  username: string;
  password: string;
  desc: string;
  atmin: boolean;
};

class rejangpedia {
  data: Data[];
  dataOnGoing: Data[];
  users: Users[];
  //===================== this is from other modules...
  mainModel: any;
  userModel: any;
  goingModel: any;
  imagekit: any;
  constructor(
    data,
    mainModel,
    dataOnGoing,
    userModel,
    goingModel,
    imagekit,
    users
  ) {
    this.data = data;
    this.mainModel = mainModel;
    this.dataOnGoing = dataOnGoing;
    this.userModel = userModel;
    this.goingModel = goingModel;
    this.imagekit = imagekit;
    this.users = users;
  }

  getData() {
    // Filter data for recommended articles
    var filteredData = this.data.filter(
      (item) =>
        item.Title.toLowerCase().includes("rejang") ||
        item.Title.toLowerCase().includes("bengkulu")
    );

    const existingData = new Set();
    const dataPilihan = [];
    const dataAcak = [];

    for (let i = 0; i < 3; i++) {
      const random = Math.floor(Math.random() * filteredData.length);
      const randomData = filteredData[random];

      if (!existingData.has(randomData)) {
        dataPilihan.push(randomData);
        existingData.add(randomData);
      }
    } // Loop for recommended data

    const existingDataPilihan = new Set(dataPilihan);
    for (let i = 0; i < 3; i++) {
      const random2 = Math.floor(Math.random() * this.data.length);
      const randomData2 = this.data[random2];

      if (
        !existingData.has(randomData2) &&
        !existingDataPilihan.has(randomData2)
      ) {
        dataAcak.push(randomData2);
      }
    } // Loop for very random data
    return {
      data: filteredData,
      dataPilihan: dataPilihan,
      dataAcak: dataAcak,
    };
  }

  getDetails(id, onGoing) {
    let theData;
    if (onGoing) {
      theData = this.dataOnGoing.find((obj) => obj.id === id);
      // Check if the data is null
      if (theData === null) {
        return { data: "Data tidak ditemukan" };
      }
    } else {
      theData = this.data.find((obj) => obj.id === id);
    }

    // Check if the data is undefined
    if (!theData) {
      return { data: "Data tidak ditemukan" };
    }

    return { data: theData };
  }

  async recrutAdmin(id) {
    const foundUser = await this.userModel.findOne({ id: id });
    const foundUserServer = this.users.find((user) => user.id === id);

    if (foundUser) {
      // If the user is found, set the 'atmin' property to true
      if (!foundUser.atmin) {
        await this.userModel.updateOne(
          { _id: foundUser._id },
          { $set: { atmin: true } }
        );
        foundUserServer.atmin = true;
      }
    }
  }

  async search(searchTerm) {
    try {
      // 1. Mencari di data lokal
      const localDataResults = this.data.filter((item) =>
        item.Title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // 2. Mencari di Wikipedia
      const wikipediaResults = await this.searchWikipedia(searchTerm);

      // 3. Menggabungkan hasil dari kedua sumber tanpa duplikasi
      const combinedResults = [...localDataResults];

      wikipediaResults.forEach((wikipediaItem) => {
        const isDuplicate = localDataResults.some(
          (localItem) => localItem.id === wikipediaItem.id
        );

        if (!isDuplicate) {
          combinedResults.push(wikipediaItem);
        }
      });

      return combinedResults;
    } catch (error) {
      console.error("Error searching:", error.message);
      return [];
    }
  }

  async searchWikipedia(searchTerm) {
    try {
      // Mengecek apakah data sudah ada berdasarkan judul
      const existingData = this.data.find((item) => item.Title === searchTerm);
      if (existingData) {
        return [existingData]; // Mengembalikan data yang sudah ada dalam bentuk array jika ditemukan
      }

      const apiUrl = `https://id.wikipedia.org/w/api.php?action=query&format=json&titles=${searchTerm}&prop=extracts|pageimages&exintro=true&pithumbsize=300`;

      const response = await axios.get(apiUrl);
      const pageId = Object.keys(response.data.query.pages)[0];
      const title = response.data.query.pages[pageId].title;
      const content = response.data.query.pages[pageId].extract;

      // Ambil informasi gambar jika tersedia
      let imageUrl = "";
      if (response.data.query.pages[pageId].original) {
        imageUrl = response.data.query.pages[pageId].original.source;
      } else if (response.data.query.pages[pageId].thumbnail) {
        imageUrl = response.data.query.pages[pageId].thumbnail.source;
      }

      // Menambahkan data baru ke this.data
      const newData: Data = {
        id: title,
        Title: title,
        Image: imageUrl,
        Pembuat: "",
        Diedit: "",
        Link: "",
        Content: [
          {
            babTitle: "", // You might want to set babTitle appropriately or fetch it from the API
            babContent: content,
          },
        ],
      };

      this.data.push(newData);

      return [newData]; // Mengembalikan data baru dalam bentuk array
    } catch (error) {
      console.error("Error fetching data from Wikipedia:", error.message);
      return [];
    }
  }

  delete(id, ongoing) {
    if (ongoing) {
      // Delete the article from the 'mainModel'
      this.goingModel
        .deleteOne({ id: id })
        .then(function () {
          console.log("deleted"); // Success
          this.dataOnGoing = this.dataOnGoing.filter((obj) => obj.id !== id); // Filter the data
        })
        .catch(function (error) {
          console.log(error); // Failure
        });
    } else {
      // Delete the article from the 'mainModel'
      this.mainModel
        .deleteOne({ id: id })
        .then(function () {
          console.log("deleted"); // Success
          this.data = this.data.filter((obj) => obj.id !== id); // Filter the data
        })
        .catch(function (error) {
          console.log(error); // Failure
        });
    }
  }

  async captcha(req, res) {
    const token = req.body["g-recaptcha-response"]; // Get the reCAPTCHA token
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
    ); // Send an axios request for the token
    if (!response.data.success)
      return res.json({ msg: "reCAPTCHA tidak valid" });
  }

  async edit(req) {
    const acceptedData = this.data.find((obj) => obj.id === req.params.id);
    const user = req.body;

    if (acceptedData.Pembuat !== null) {
      // If the article maker is not empty
      this.dataOnGoing.unshift({
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
      await this.goingModel.create({
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
      this.dataOnGoing.unshift({
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
      await this.goingModel.create({
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
  }

  async accept(id, res) {
    const acceptedData = this.dataOnGoing.find((obj) => obj.id === id);

    if (!acceptedData) {
      res.send("Data not found");
      return;
    }

    try {
      // Find the index of the ongoing article in the 'data' array
      const existingDataIndex = this.data.findIndex((obj) => obj.id === id);

      // Delete the ongoing article from the 'goingModel'
      await this.goingModel.deleteOne({ id: id });

      // Update or create the data in the 'data' array
      if (existingDataIndex !== -1) {
        this.data[existingDataIndex] = acceptedData;
        await this.mainModel.findOneAndUpdate({ id: id }, acceptedData);
      } else {
        this.data.push(acceptedData);

        // Create a new document in the 'mainModel' collection
        await this.mainModel.create({
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
      this.dataOnGoing = this.dataOnGoing.filter((obj) => obj.id !== id);

      // Render the 'ongoing' page with the updated data
      res.render("ongoing", {
        data: this.dataOnGoing,
        dataUtama: this.data,
      });
    } catch (error) {
      // Check if the ongoing article with that ID already exists in 'data'
      const existingDataIndex = this.data.findIndex((obj) => obj.id === id);

      // Update or create the data in the 'data' array
      if (existingDataIndex !== -1) {
        this.data[existingDataIndex] = acceptedData;
        await this.mainModel.findOneAndUpdate({ id: id }, acceptedData);
      } else {
        this.data.push(acceptedData);

        // Create a new document in the 'mainModel' collection
        await this.mainModel.create({
          id: acceptedData.id,
          Title: acceptedData.Title,
          Pembuat: acceptedData.Pembuat,
          Image: acceptedData.Image,
          Diedit: "",
          Content: acceptedData.Content,
          Link: acceptedData.Link,
        });

        // Delete the ongoing article from the 'goingModel'
        await this.goingModel.deleteOne({ id: id });
      }

      // Remove the ongoing article from the 'dataOnGoing' array
      this.dataOnGoing = this.dataOnGoing.filter((obj) => obj.id !== id);
      res.redirect("/accept");
    }
  }

  async newArticle(req) {
    const uniqueFileName = uuidv1(); // Initialize a unique filename using uuidv1
    const user = req.body; // Get the request body
    var image = image;
    if (req.file) {
      await this.imagekit.upload({
        file: req.file.buffer,
        fileName: `image-${uniqueFileName}.jpg`,
        folder: "/RejangPedia",
        useUniqueFileName: false,
      });
      image =
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg";
    }

    // Unshift the data to the 'dataOnGoing' array
    this.dataOnGoing.unshift({
      id: uniqueFileName,
      Title: user.title,
      Pembuat: user.pembuat,
      Image: image,
      Diedit: "",
      Link: user.link.replace("/watch?v=", "/embed/"),
      Content: JSON.parse(user.content),
    });

    // Upload the data to MongoDB using the 'goingModel'
    await this.goingModel.create({
      id: uniqueFileName,
      Title: user.title,
      Image: image,
      Pembuat: user.pembuat,
      Link: user.link.replace("/watch?v=", "/embed/"),
      Content: JSON.parse(user.content),
    });
  }
}
module.exports = function (
  server: any,
  data: any[],
  mainModel: any,
  dataOnGoing: any[],
  userModel: any,
  goingModel: any,
  imagekit: any,
  users: any
) {
  const storage = multer.memoryStorage();

  // After the storage is configured, initialize the upload function
  const upload = multer({ storage: storage }); // Middleware for handling article uploads

  const app = new rejangpedia(
    data,
    mainModel,
    dataOnGoing,
    userModel,
    goingModel,
    imagekit,
    users
  );

  // Route to get the main page of Rejangpedia
  server.get("/", function (req, res) {
    res.render("home", app.getData());
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
    res.render("details", app.getDetails(req.params.id, false));
  });

  // Route to render the ongoing article details page
  server.get("/details/ongoing/:id", function (req, res) {
    res.render("details", app.getDetails(req.params.id, true));
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
    app.recrutAdmin(userId);
    res.redirect("/rekrutatmin");
  });

  // Route to render the 'edit' page for editing an article
  server.get("/edit/:id", function (req, res) {
    res.render("edit", app.getDetails(req.params.id, false));
  });

  // Route to handle searching for articles
  server.get("/search", async function (req, res) {
    const searchTerm = req.query.term; // Get the user input

    /* const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Say this is a test" }],
      model: "text-davinci-003",
    });*/
    res.render("search-results", {
      results: app.search(searchTerm),
      //ai: response,
    });
  });

  // Route to handle editing an article
  server.post("/edit/:id", async function (req, res) {
    app.captcha(req, res);
    app.edit(req);

    res.redirect("/");
  });

  // Route to handle deleting an article
  server.get("/delete/:id", async function (req, res) {
    app.delete(req.params.id, false);
    res.redirect("/accept");
  });

  // Route to handle deleting an ongoing article
  server.get("/accept/delete/:id", async function (req, res) {
    app.delete(req.params.id, true);
    res.redirect("/accept");
  });

  // Route to accept the ongoing article and move it to the main data
  server.get("/accept/:id", async function (req, res) {
    app.accept(req.params.id, res);
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
    app.captcha(req, res);
    app.newArticle(req);
    res.redirect("/");
  });

  server.get("/api/getData", async function (req, res) {
    res.json(app.getData());
  });

  server.get("/api/details/:id", async function (req, res) {
    res.json(app.getDetails(req.params.id, false));
  });
  server.get("/api/ongoing/:id", async function (req, res) {
    res.json(app.getDetails(req.params.id, true));
  });
  server.get("/api/recrut", async function (req, res) {
    res.json({
      data: users,
    });
  });
  server.get("/api/admin-new/:id", async function (req, res) {
    app.recrutAdmin(req.params.id);
  });
  server.get("/search", async function (req, res) {
    res.json({
      results: app.search(req.query.searchTerm),
    });
  });
};
