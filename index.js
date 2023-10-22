const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs"); // Import modul fs
const { mainModel, goingModel } = require("./models/post");
const mongoose = require("mongoose");
require("dotenv").config();

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
  res.send("coba ke /details/1 deh");
});

server.get("/new", function (req, res) {
  res.render("new");
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

server.get("/edit/:id", function (req, res) {
  const theData = data.find((obj) => obj.id === req.params.id);
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("edit", {
    data: theData,
  });
});

server.post("/edit/:id", function (req, res) {
  const user = req.body;
  console.log(user);
  dataOnGoing.unshift({
    id: req.params.id,
    Title: user.title,
    Image:
      "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
      req.params.id +
      ".jpg",
    Content: JSON.parse(user.content),
  });
  /*await goingModel.create({
      id: req.params.id,
    Title: user.title,
    Image:
      "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
      req.params.id +
      ".jpg",
    Content: JSON.parse(user.content),
    });*/

  res.send(dataOnGoing);
});

server.get("/delete/:id", async function (req, res) {
  data = data.filter((obj) => obj.id !== req.params.id);
  /*mainModel
    .deleteOne({ id: req.params.id })
    .then(function () {
      console.log("deleted"); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });*/
  console.log(data);

  res.send("coba ke /details/1 deh");
});

server.get("/accept/delete/:id", async function (req, res) {
  dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);
  /*goingModel
    .deleteOne({ id: req.params.id })
    .then(function () {
      console.log("deleted"); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });*/

  res.render("ongoing", {
    data: dataOnGoing,
  });
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

    if (existingDataIndex !== -1) {
      // Jika sudah ada, gantilah data di 'data' dengan data yang baru
      data[existingDataIndex] = acceptedData;
      await mainModel.findOneAndUpdate({ id: req.params.id }, acceptedData);
    } else {
      // Jika belum ada, tambahkan data baru ke 'data'
      data.push(acceptedData);

      /*await mainModel.create({
      id: acceptedData.id,
      Title: acceptedData.title,
      Image: acceptedData.Image,
      Content: acceptedData.content,
    });
    await goingModel.deleteOne({ id: req.params.id });*/
    }

    // Hapus dataOnGoing berdasarkan ID
    dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);

    res.render("ongoing", {
      data: dataOnGoing,
    });
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.send("Terjadi kesalahan saat mengunggah gambar ke ImageKit");
  }
});

server.get("/accept/", function (req, res) {
  res.render("ongoing", {
    data: dataOnGoing,
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

    dataOnGoing.unshift({
      id: uniqueFileName,
      Title: user.title,
      Image:
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg",
      Content: JSON.parse(user.content),
    });
    /*await goingModel.create({
      id: uniqueFileName,
      Title: user.title,
      Image:
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg",
      Content: JSON.parse(user.content),
    });*/

    // Gunakan UUID sebagai nama berkas gambar
    cb(null, `image-${uniqueFileName}.jpg`);
  },
});

const upload = multer({ storage: storage });

server.post("/new", upload.single("image"), function (req, res) {
  // Kirim respons dengan dataOnGoing yang telah diperbarui
  res.send(dataOnGoing);
});

const port = 1945;
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
