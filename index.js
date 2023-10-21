const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs"); // Import modul fs

var ImageKit = require("imagekit");
var imagekit = new ImageKit({
  publicKey: "public_sfR8hcnPMIJ1ilavSLhv5IZiZ7E=",
  privateKey: "private_eKrKi5RKb3/NijnWKF82mNgH4gA=",
  urlEndpoint: "https://ik.imagekit.io/9hpbqscxd/",
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

var data = [
  {
    id: 1,
    Title: "Halo Semuanya",
    Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-1.jpg",
    Content: [
      {
        babTitle: "Bab 1: Pendahuluan",
        babContent: "Isi dari Bab 1: Pendahuluan",
      },
      {
        babTitle: "Bab 2: Bab Kedua",
        babContent: "Isi dari Bab 2: Bab Kedua",
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
  const theData = data[req.params.id - 1];
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("edit", {
    data: theData,
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

      // Jika unggah gambar ke ImageKit berhasil, hapus gambar dari server lokal
      // (Pastikan Anda menangani kesalahan dengan baik jika ada masalah dalam penghapusan)
      if (uploadResponse && uploadResponse.success) {
        const filePath = `public/images/uploads/image-${acceptedData.id}.jpg`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Gagal menghapus gambar lokal:", err);
          }
        });
      }
    }

    // Tambahkan data ke "data" dan hapus dari "dataOnGoing"
    data.push(acceptedData);
    dataOnGoing = dataOnGoing.filter(
      (obj) => obj.id !== parseInt(req.params.id)
    );

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
  filename: function (req, file, cb) {
    // Buat UUID baru
    const uniqueFileName = uuidv1().substring(0, 8); // Gunakan hanya 8 karakter dari UUID

    const user = req.body;

    // Tambahkan data ke dataOnGoing
    dataOnGoing.unshift({
      id: uniqueFileName,
      Title: user.title,
      Image:
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg",
      Content: JSON.parse(user.content),
    });

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
server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
