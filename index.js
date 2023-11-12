const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs"); // Import modul fs
const { mainModel, goingModel, socialModel } = require("./models/post");
const { userModel } = require("./models/user");
const passport = require('passport');
const session = require('express-session');
const axios = require("axios");

const mongoose = require("mongoose");

require("dotenv").config();

var ImageKit = require("imagekit");
var imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndpoint,
});
// New Post
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/images/uploads");
  },
  filename: async function(req, file, cb) {
    const uniqueFileName = uuidv1();

    const user = req.body;
    //console.log(user);
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
const storageSocial = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `public/images/uploads`)
  },
  filename: function(req, file, cb) {
    cb(null, `image-${(data.length + 100)}.jpg`)
  }
})

const upload = multer({ storage: storage });
const uploadSocial = multer({ storage: storageSocial });


var users = []; // Array untuk menyimpan data pengguna yang mendaftar
userModel.find({}, null).then(docs => { users = docs })

/**
 * @param {mainModel} model 
 */
var shuf = true; //* for shuffle
var postCounter = 0;

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
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
  clientID: '261195612279-5u3rrjmbcqeoa45n60the39n1n384q3h.servers.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Save user profile data in the 'userProfile' object (you can save it in a database)
  userProfile[profile.id] = profile;
  return done(null, profile);
}));
server.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

server.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
}), (req, res) => {
  // Berhasil masuk, redirect ke halaman chat
  res.redirect('/chat');
});
server.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Periksa apakah username sudah ada
  const isUsernameTaken = users.some((user) => user.username === username);

  if (isUsernameTaken) {
    return res.send("Maaf, username tersebut sudah ada. Anda bisa menambahkan angka atau kata lain untuk membuat username Anda unik. <a href='/signup' > Kembali </a>");
  }
  await userModel.create({ 
    id: username,
    username: username,
    password: password, });
  // Jika username belum ada, simpan data pengguna yang mendaftar dalam objek users
  users.push({
    id: username,
    username: username,
    password: password,
  });

  return res.redirect('/chat');
});

// Implementasi login
server.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Cek apakah pengguna sudah terdaftar dan password sesuai
  const userIndex = users.findIndex((u) => u.username === username && u.password === password);
  if (userIndex !== -1) {
    // Jika pengguna ditemukan, kirim data pengguna ke halaman "success"
    return res.render("success", {
      user: users[userIndex].username,
    });
  } else {
    // Redirect ke halaman login dengan pesan kesalahan
    return res.send("Password Salah");
  }
});
server.get('/login', (req, res) => {
  res.render('login');
});
server.get('/signup', (req, res) => {
  res.render('signup');
});


var data = [];
mainModel.find({}, null).then((docs) => {
  data = docs;
});

var dataOnGoing = [];
goingModel.find({}, null).then((docs) => {
  dataOnGoing = docs;
});



server.get("/", function(req, res) {
  // Filter data berdasarkan properti Title
  var filteredData = data.filter(
    (item) =>
      item.Title.toLowerCase().includes("rejang") ||
      item.Title.toLowerCase().includes("bengkulu")
  );

  // Buat Set untuk melacak data yang sudah ada
  const existingData = new Set();
  const dataPilihan = [];
  const dataAcak = [];

  for (i = 0; i<3; i++) {
    const random = Math.floor(Math.random() * filteredData.length);
    const randomData = filteredData[random];

    if (!existingData.has(randomData)) {
      dataPilihan.push(randomData);
      existingData.add(randomData);
    }
  }

  // Buat Set untuk melacak data yang sudah ada dalam dataPilihan
  const existingDataPilihan = new Set(dataPilihan);

  for (i = 0; i<3; i++) {
    const random2 = Math.floor(Math.random() * data.length);
    const randomData2 = data[random2];

    if (!existingData.has(randomData2) && !existingDataPilihan.has(randomData2)) {
      dataAcak.push(randomData2);
    }
  }
  res.render("home", {
    data: filteredData,
    dataPilihan: dataPilihan,
    dataAcak: dataAcak,
  });
});


server.get("/new", function(req, res) {
  res.render("new");
});

server.get("/peraturan", function(req, res) {
  res.render("peraturan");
});

server.get("/tentang", function(req, res) {
  res.render("tentang");
});
server.get("/dropdown", function(req, res) {
  res.render("dropdown");
});

server.get("/details/:id", function(req, res) {
  const theData = data.find((obj) => obj.id === req.params.id);
  //console.log(theData);
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("details", {
    data: theData,
  });
});

server.get("/details/ongoing/:id", function(req, res) {
  const theData = dataOnGoing.find((obj) => obj.id === req.params.id);
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("details", {
    data: theData,
  });
});

server.get("/edit/:id", function(req, res) {
  const theData = data.find((obj) => obj.id === req.params.id);
  if (theData === null) {
    res.send("The Heck Bro");
  }
  res.render("edit", {
    data: theData,
  });
});
server.get("/search", function(req, res) {
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

server.post("/edit/:id", async function(req, res) {
  const token = req.body["g-recaptcha-response"];
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  if (!response.data.success) return res.json({ msg: "reCAPTCHA tidak valid" });
  const acceptedData = data.find((obj) => obj.id === req.params.id);
  //console.log(acceptedData);
  const user = req.body;
  //console.log(user);
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

server.get("/delete/:id", async function(req, res) {
  data = data.filter((obj) => obj.id !== req.params.id);
  mainModel
    .deleteOne({ id: req.params.id })
    .then(function() {
      //console.log("deleted"); // Success
    })
    .catch(function(error) {
      //console.log(error); // Failure
    });
  //console.log(data);

  res.redirect("/accept");
});

server.get("/accept/delete/:id", async function(req, res) {
  dataOnGoing = dataOnGoing.filter((obj) => obj.id !== req.params.id);
  goingModel
    .deleteOne({ id: req.params.id })
    .then(function() {
      //console.log("deleted"); // Success
    })
    .catch(function(error) {
      //console.log(error); // Failure
    });

  res.redirect("/accept");
});

server.get("/accept/:id", async function(req, res) {
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
      .then(function() {
        //console.log("deleted"); // Success
      })
      .catch(function(error) {
        //console.log(error); // Failure
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

server.get("/accept/", function(req, res) {
  res.render("ongoing", {
    data: dataOnGoing,
    dataUtama: data,
  });
});

server.get("/data/", function(req, res) {
  res.render("data", {
    data: data,
  });
});

server.post("/new", upload.single("image"), async function(req, res) {
  const token = req.body["g-recaptcha-response"];
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  if (!response.data.success) return res.json({ msg: "reCAPTCHA tidak valid" });

  res.redirect("/");
});
//===============================================================
//MEDSOOOOOS
async function post(data, noteContent, noteName, noteId, color, model, file, res) {
  try {
    if (noteContent.trim() !== "" && noteName.trim() !== "") {
      //TODO next we will add the post to database first.
      await model.create({ noteContent, noteName, noteId, color, comment: [], like: 0})
      data.unshift({ noteId, noteContent, noteName, like: 0, comment: [], color })
      shuf = false
    }
    if (file) {
      const ext = file.filename.split(".")[file.filename.split(".").length - 1]
        console.log(file)
        fs.readFile(path.join(__dirname, '/public/images/uploads', 'image-'+(data.length + 99)+".jpg"), async function(err, data) {
          if (err) throw err; // Fail if the file can't be read.
          await imagekit.upload({
            file : data, //required
            fileName : 'image-'+noteId+".jpg", //required
            folder: "/RejangConnection",
            useUniqueFileName: false,
          }, function(error, result) {
            if(error) console.log(error);
            else console.log(result);          });
        });
        const imageFileName = `image-${(data.length + 99) }.jpg`;
        const imageFilePath = path.join(__dirname, '/public/images/uploads', imageFileName);
        if (fs.existsSync(imageFilePath)) {
          fs.unlinkSync(imageFilePath);
        }


    }
                res.redirect("/chat")

  } catch (err) {
    console.error(err)
  }
}
//==================
var dataSocial = []
socialModel.find({}, null).then((docs) => {
  dataSocial = docs;
  console.log(dataSocial)

  function shuffleOnClient(data) {

  return data

}
server.get("/page/:pageNumber", function(req, res) {
  res.render("social", {
    data: dataSocial,
  })
});
server.get("/chat", function(req, res) {

  res.render("social", {
    data: dataSocial,
  })
});
server.get("/chat/share/:noteId", function(req, res) {
  const noteIdGet = req.params.noteId.trim();

  const itemIndex = dataSocial.findIndex(({noteId}) => noteId == noteIdGet)
  res.render("detailsSocial", {
    element: dataSocial[itemIndex],
  });
});
server.get("/chat/:noteId", function(req, res) {
  const noteIdGet = req.params.noteId.trim();

  const matchingItems = dataSocial.filter(({ noteName }) => noteName === noteIdGet);
   const itemIndex = users.findIndex(({username}) => username == noteIdGet)
  res.render("user", {
    data: matchingItems,
    userData: users[itemIndex]
  })
});
//==============================================
server.post("/chat",uploadSocial.single("image"), async (req, res) => {
  const token = req.body["g-recaptcha-response"];
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  if (!response.data.success) return res.json({ msg: "reCAPTCHA tidak valid" });
  //TODO first things, we will make the const variable from the req data
  const noteContent = req.body.noteContent
  const noteName = req.body.noteName
  const noteId = uuidv1();
  const noteColor = req.body.noteColor
  const file = req.file;

  //TODO then call the function
  await post(dataSocial, noteContent, noteName, noteId, noteColor, socialModel, file, res);
})
server.post("/chat/comment/:noteId", async (req, res) => {
  const commentContent = req.body.commentContent;
  const commenterName = req.body.commenterName;
  const noteIdPost = req.params.noteId;
  const commentID = dataSocial.length + 50;

    await socialModel.findOneAndUpdate({ noteId: noteIdPost }, { $push: { comment: { commentContent, commentId: commentID, commenterName } } })
      const itemIndex = dataSocial.findIndex(({noteId}) => noteId == noteIdPost)
      console.log(itemIndex)
        if (itemIndex !== -1) {
          dataSocial[itemIndex].comment.push({ commentID, commenterName, commentContent });
        }

        shuf = false;
        

});
server.post("/chat/like/:noteId", (req, res) => {
  //TODO first the shuf we will be false
  shuf = false;
  const noteIdPost = parseInt(req.params.noteId.trim());

  //TODO next we will be search the position of noteId
  const itemIndex = dataSocial.findIndex(({noteId}) => noteId == noteIdPost)

  if (itemIndex !== -1) {
    const item = data.splice(itemIndex, 1)[0];
    dataSocial.unshift(item);
    if (!item.hasLiked) {
      //TODO like usualy,the script will run the database first
      socialModel.findOneAndUpdate({noteId: noteIdPost}, { $inc: { like: 1 } })
        .then(() => {
          item.like >= 0 ? item.like++ : item.like = 1
          item.hasLiked = true;
          res.cookie(`liked_${noteIdPost}`, "true");
          res.redirect("/chat");
        })
        .catch(err => console.error(err))
    }
  }
});
});

//==============================================

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
