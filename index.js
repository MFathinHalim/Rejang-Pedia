const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

var ImageKit = require("imagekit");
/*var imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndpoint,
});*/
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
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  // Anda juga bisa menggunakan '*' untuk mengizinkan semua asal, tetapi ini tidak disarankan untuk produksi.
  // res.header('Access-Control-Allow-Origin', '*');
  next();
});

var data = [
  {
    id: 1,
    Title: "Halo Semuanya",
    Content: [
      {
        babTitle: "Bab 1: Pendahuluan",
        babContent: "Isi dari Bab 1: Pendahuluan",
        image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/for-id-1-1.jpg",
      },
      {
        babTitle: "Bab 2: Bab Kedua",
        babContent: "Isi dari Bab 2: Bab Kedua",
        image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/for-id-1-2.jpg",
      },
      {
        babTitle: "Bab 3: Bab Ketiga",
        babContent: "Isi dari Bab 3: Bab Ketiga",
      },
    ],
  },
];
var dataOnGoing = [
  {
    id: 3,
    Title: "AKU MAU KE BULAN",
    Content: [
      {
        babTitle: "Bab 1: Pendahuluan",
        babContent: "MAMAH MAU KE BUULAN",
        image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/for-id-1-1.jpg",
      },
      {
        babTitle: "Bab 2: Bab Kedua",
        babContent: "CARANYA GIMANA COOO",
      },
      {
        babTitle: "Bab 3: Bab Ketiga",
        babContent: "DARI MANA DUITNYAAA",
      },
    ],
  },
];

server.get("/", function (req, res) {
  res.send("coba ke /details/1 deh");
});

server.get("/new", function (req, res) {
  res.render("new");
});

server.get("/details/:id", function (req, res) {
  const theData = data[req.params.id - 1];
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("details", {
    data: theData,
  });
});

server.get("/edit/:id", function (req, res) {
  const theData = data[req.params.id - 1];
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("edit", {
    data: theData,
  });
});

server.get("/accept/:id", function (req, res) {
  data.push(dataOnGoing.find((obj) => obj.id === parseInt(req.params.id)));
  dataOnGoing = dataOnGoing.filter((obj) => obj.id !== parseInt(req.params.id));
  res.render("ongoing", {
    data: dataOnGoing,
  });
});

server.get("/accept/", function (req, res) {
  res.render("ongoing", {
    data: dataOnGoing,
  });
});

server.post("/new", function (req, res) {
  /*var user = req.body;
  dataOnGoing.unshift({
    id: data.length + 1,
    Title: user.title,
    Content: JSON.parse(user.content), // Parse the JSON content
  });
  res.send(dataOnGoing);*/
  console.log("cuman debug image");
});

const port = 1945;
server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
