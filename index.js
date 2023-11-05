const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs"); // Import modul fs
const { mainModel, goingModel } = require("./models/post");
const mongoose = require("mongoose");

require("dotenv").config();
const axios = require("axios");

var ImageKit = require("imagekit");
var imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndpoint,
});
const server = express();
server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "/public")));
server.use(
  express.static(path.join(__dirname, "/node_modules/bootstrap/dist"))
);
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

var data = [];
mainModel.find({}, null).then((docs) => {
  data = docs;
});

var dataOnGoing = [];
goingModel.find({}, null).then((docs) => {
  dataOnGoing = docs;
});

server.get("/", function (req, res) {
  // Filter data berdasarkan properti Title
  var filteredData = data.filter(
    (item) =>
      item.Title.toLowerCase().includes("rejang") ||
      item.Title.toLowerCase().includes("bengkulu")
  );
  const dataPilihan = [];
  while (dataPilihan.length < 3) {
    const random = Math.floor(Math.random() * filteredData.length);
    const randomData = filteredData[random];

    // Periksa apakah data tersebut sudah ada di dataPilihan
    if (!dataPilihan.includes(randomData)) {
      dataPilihan.push(randomData);
    }
  }
  console.log(dataPilihan);
  res.render("home", {
    data: filteredData,
    dataPilihan: dataPilihan,
  });
});

server.get("/new", function (req, res) {
  res.render("new");
});

server.get("/peraturan", function (req, res) {
  res.render("peraturan");
});

server.get("/tentang", function (req, res) {
  res.render("tentang");
});
server.get("/dropdown", function (req, res) {
  res.render("dropdown");
});

server.get("/details/:id", function (req, res) {
  const theData = data.find((obj) => obj.id === req.params.id);
  console.log(theData);
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("details", {
    data: theData,
  });
});

server.get("/details/ongoing/:id", function (req, res) {
  const theData = dataOnGoing.find((obj) => obj.id === req.params.id);
  console.log(theData);
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("details", {
    data: theData,
  });
});

server.get("/edit/:id", function (req, res) {
  const theData = data.find((obj) => obj.id === req.params.id);
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("edit", {
    data: theData,
  });
});
server.get("/search", function (req, res) {
  const searchTerm = req.query.term;
  // Lakukan pencarian berdasarkan `searchTerm` di data Anda
  const searchResults = data.filter((item) =>
    item.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  res.render("search-results", {
    results: searchResults,
    searchTerm: searchTerm,
  });
});

server.post("/edit/:id", async function (req, res) {
  const token = req.body["g-recaptcha-response"];
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  if (!response.data.success) return res.json({ msg: "reCAPTCHA tidak valid" });
  const acceptedData = data.find((obj) => obj.id === req.params.id);
  console.log(acceptedData);
  const user = req.body;
  console.log(user);
  if (acceptedData.Pembuat !== null) {
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

server.get("/delete/:id", async function (req, res) {
  data = data.filter((obj) => obj.id !== req.params.id);
  mainModel
    .deleteOne({ id: req.params.id })
    .then(function () {
      console.log("deleted"); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
  console.log(data);

  res.redirect("/accept");
});

server.get("/accept/delete/:id", async function (req, res) {
  dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);
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

server.get("/accept/:id", async function (req, res) {
  const acceptedData = dataOnGoing.find((obj) => obj.id === req.params.id);

  if (!acceptedData) {
    res.send("Data not found");
    return;
  }

  try {
    // Lakukan unggah gambar ke ImageKit di sini
    if (acceptedData.Image) {
      const uploadResponse = await imagekit.upload({
        file: fs.readFileSync(
          `public/images/uploads/image-${acceptedData.id}.jpg`
        ), // Path gambar di server lokal
        fileName: `image-${acceptedData.id}.jpg`, // Nama berkas di ImageKit
        folder: "/RejangPedia", // Gantilah dengan folder yang diinginkan
        useUniqueFileName: false,
      });

      if (uploadResponse && uploadResponse.success) {
        const filePath = `public/images/uploads/image-${acceptedData.id}.jpg`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Gagal menghapus gambar lokal:", err);
          }
        });
      }
    }

    // Cek apakah dataOnGoing dengan ID tersebut sudah ada di data
    const existingDataIndex = data.findIndex((obj) => obj.id === req.params.id);
    await goingModel
      .deleteOne({ id: req.params.id })
      .then(function () {
        console.log("deleted"); // Success
      })
      .catch(function (error) {
        console.log(error); // Failure
      });
    if (existingDataIndex !== -1) {
      // Jika sudah ada, gantilah data di 'data' dengan data yang baru
      data[existingDataIndex] = acceptedData;
      await mainModel.findOneAndUpdate({ id: req.params.id }, acceptedData);
    } else {
      // Jika belum ada, tambahkan data baru ke 'data'
      data.push(acceptedData);

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

    // Hapus dataOnGoing berdasarkan ID
    dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);

    res.render("ongoing", {
      data: dataOnGoing,
      dataUtama: data,
    });
  } catch (error) {
    // Cek apakah dataOnGoing dengan ID tersebut sudah ada di data
    const existingDataIndex = data.findIndex((obj) => obj.id === req.params.id);

    if (existingDataIndex !== -1) {
      // Jika sudah ada, gantilah data di 'data' dengan data yang baru
      data[existingDataIndex] = acceptedData;
      await mainModel.findOneAndUpdate({ id: req.params.id }, acceptedData);
    } else {
      // Jika belum ada, tambahkan data baru ke 'data'
      data.push(acceptedData);

      await mainModel.create({
        id: acceptedData.id,
        Title: acceptedData.Title,
        Pembuat: acceptedData.Pembuat,
        Image: acceptedData.Image,
        Diedit: "",
        Content: acceptedData.Content,
        Link: acceptedData.Link,
      });
      await goingModel.deleteOne({ id: req.params.id });
    }

    // Hapus dataOnGoing berdasarkan ID
    dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);

    res.redirect("/accept");
  }
});

server.get("/accept/", function (req, res) {
  res.render("ongoing", {
    data: dataOnGoing,
    dataUtama: data,
  });
});

server.get("/data/", function (req, res) {
  res.render("data", {
    data: data,
  });
});
// New Post
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads");
  },
  filename: async function (req, file, cb) {
    const uniqueFileName = uuidv1();

    const user = req.body;
    console.log(user);
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

    // Gunakan UUID sebagai nama berkas gambar
    cb(null, `image-${uniqueFileName}.jpg`);
  },
});

const upload = multer({ storage: storage });

server.post("/new", upload.single("image"), async function (req, res) {
  const token = req.body["g-recaptcha-response"];
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  if (!response.data.success) return res.json({ msg: "reCAPTCHA tidak valid" });

  res.redirect("/");
});

const port = 3000;
const uri = process.env.MONGODBURI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    server.listen(port, () => {
      Host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0";
      console.log(`server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
