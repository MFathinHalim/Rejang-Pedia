/*Hello Everyone, 
  Welcome to rejangpedia main script! in this script will be the main script of the backend for rejangpedia!
  the programmer for this script is M.Fathin Halim!

  rejangpedia
  rejangpedia is an all-in application with a spirit of mutual cooperation in preserving Bengkulu culture in general 
  and Rejang Lebong in particular in the form of digital literacy where everyone can participate.!
  
  The Repeat :
    req.body = request from user
    res.render = response for server to open the EJS
    server.get() = get the page. Ex: /login, /signup, / , /tentang, etc.
    id: uniqueFileName, the id (we use uuidv1)

    Title: user.title, the title of the article

    Pembuat: user.pembuat, the article maker(optional btw)

    Image: "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-"+uniqueFileName+".jpg", the image link for imagekit

    Diedit: "", for the last edit, for the first time, it will be empty

    Link: user.link.replace("/watch?v=", "/embed/"), the youtube video embed link, it also OPTIONAL

    Content: JSON.parse(user.content), the content of the article

    data = data.filter((obj) => obj.id !== req.params.id); search the data
*/

//=============================================================================================================================================
//First one is import the module we use
const express = require("express"); //This is the express module, for our server
const bodyParser = require("body-parser"); //this is body-parser, for form at frontend
const path = require("path"); //this is a default path for image
const multer = require("multer"); //this is multer for upload file(yes, it's image)
const { v1: uuidv1 } = require("uuid"); //this is uuid, that we use to make a unique id
const fs = require("fs"); //fs is for file system
const passport = require("passport"); //this for passport at google Login
const session = require("express-session"); //this for express-session(google login)
const axios = require("axios"); // this is for send request (in this script for recaptcha)
const mongoose = require("mongoose"); //this is mongoDB database
const ejs = require("ejs"); //this is ejs
var ImageKit = require("imagekit"); //and this is ImageKit(CDN for this app)
//==========================================================================================
const { mainModel, goingModel, socialModel } = require("./models/post"); //this is for postModel(main, ongoing, and social media)
/*
 this is for user model(for now its only use at social media, but it can be to main app too :D ) 
*/
const { userModel } = require("./models/user");
require("dotenv").config(); //and this is for env
//==========================================================================================
//This is for startup the imagekit
var imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndpoint,
});
//==========================================================================================
//This is for main enksiklopedia upload... it can be better...
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads");
  },
  filename: async function (req, file, cb) {
    const uniqueFileName = uuidv1(); //initialize the uuidv1(). Ex: 188438d0-70a4-11ee-acd8-7d4adb250123
    const user = req.body; //get the request body

    // first, we will unshift the data of onGoing
    dataOnGoing.unshift({
      id: uniqueFileName, //the id (we use uuidv1)
      Title: user.title, //the title of the article
      Pembuat: user.pembuat, //the article maker(optional btw)
      Image:
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg", //the image link for imagekit
      Diedit: "", //for the last edit, for the first time, it will be empty
      Link: user.link.replace("/watch?v=", "/embed/"), //the youtube video embed link, it also OPTIONAL
      Content: JSON.parse(user.content), //the content of the article
    });

    //after that, we can upload it to mongodb
    await goingModel.create({
      id: uniqueFileName, //the id (we use uuidv1)
      Title: user.title, //the title of the article
      Image:
        "https://ik.imagekit.io/9hpbqscxd/RejangPedia/image-" +
        uniqueFileName +
        ".jpg", //the image link for image kit
      Pembuat: user.pembuat, //the article maker (optional btw)
      Link: user.link.replace("/watch?v=", "/embed/"), //the youtube video embed link, it also OPTIONAL
      Content: JSON.parse(user.content), //the content of the article
    });

    // use uuidv1 to unique file name
    cb(null, `image-${uniqueFileName}.jpg`);
  },
});

//this is storage multer for social media
const storageSocial = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/images/uploads`);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `image-${data.length + 100}.jpg`,
    ); /*just make it simple, the id at the @param {post} function */
  },
});

//after the storage is ready, we will initialize the upload function
const upload = multer({ storage: storage }); //for article upload
const uploadSocial = multer({ storage: storageSocial }); //for social media upload

//=================================================================================
//now we will add the server
const server = express(); //call the express
server.set("view engine", "ejs"); //set view engine to EJS
server.use(express.static(path.join(__dirname, "/public"))); //so it can access public in EJS
server.set("view options", { compileDebug: false });
// Override EJS compile function to suppress undefined variable logs
server.engine("ejs", (filePath, options, callback) => {
  try {
    const rendered = ejs.renderFile(filePath, options, callback);
    return rendered;
  } catch (error) {
    // Suppress errors related to undefined variables in EJS templates
    if (error.message.includes("is not defined")) {
      console.error("Suppressed EJS error:", error.message);
      return "";
    } else {
      // Re-throw other errors
      throw error;
    }
  }
});
//=================================
//for form body req
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
//now run the server
const port = 3000; //define the port
const uri = process.env.MONGODBURI; //get the mongodb env
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  }) //connect to mongoDB first
  .then(() => {
    server.listen(port, () => {
      Host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0";
      console.log(`server is running on port ${port}`);
      mainModel.find({}, null).then((docs) => {
        data = docs;
      });
      socialModel.find({}, null).then((docs) => {
        dataSocial = docs;
      });
      //=================================================================================
      var users = []; // Array for users
      userModel.find({}, null).then((docs) => {
        users = docs;
      }); //get the array from mongodb and put it to local array!

      //=================================================================================
      var shuf = true; //* for shuffle
      var postCounter = 0; //for post counter

      //================================
      //for google sign
      passport.serializeUser(function (user, cb) {
        //======
        cb(null, user); //======
      }); //for passport in google sign
      passport.deserializeUser(function (obj, cb) {
        //======
        cb(null, obj); //======
      }); //======

      const GoogleStrategy = require("passport-google-oauth2").Strategy; //for passport google strategy
      //initialize it
      passport.use(
        new GoogleStrategy(
          {
            clientID:
              "261195612279-5u3rrjmbcqeoa45n60the39n1n384q3h.servers.googleusercontent.com",
            clientSecret: "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",
            callbackURL: "http://localhost:3000/auth/google/callback",
          },
          (accessToken, refreshToken, profile, done) => {
            userProfile[profile.id] = profile;
            return done(null, profile);
          },
        ),
      );
      server.get(
        "/auth/google",
        passport.authenticate("google", { scope: ["profile", "email"] }),
      );
      server.get(
        "/auth/google/callback",
        passport.authenticate("google", {
          failureRedirect: "/",
        }),
        (req, res) => {
          res.redirect("/chat"); //when it success, go to /chat
        },
      );

      //=================================================================================================
      //SERVER ROUTER

      //first the signup
      server.post("/signup", async (req, res) => {
        const { username, password, desc } = req.body;

        const isUsernameTaken = users.some(
          (user) => user.username === username,
        ); //is username taken?
        if (isUsernameTaken) {
          return res.send(
            "Maaf, username tersebut sudah ada. Anda bisa menambahkan angka atau kata lain untuk membuat username Anda unik. <a href='/signup' > Kembali </a>",
          );
        }
        //after that we push it to mongoDB first
        await userModel.create({
          id: username,
          username: username,
          password: password,
          desc: desc,
        });
        //then push to local array
        users.push({
          id: username,
          username: username,
          password: password,
          desc: desc,
        });
        return res.redirect("/login"); //redirect it to /login
      });

      //now the login
      server.post("/login", (req, res) => {
        const { username, password } = req.body;
        const userIndex = users.findIndex(
          (u) => u.username === username && u.password === password,
        ); // does the user password is correct ?
        if (userIndex !== -1) {
          return res.render("success", {
            user: users[userIndex].username,
            id: users[userIndex].id,
          }); //redirect it to success for localStorage
        } else {
          return res.send("Password Salah"); //the password is wrong
        }
      });

      //the 2 router this for get /login or /signup page
      server.get("/login", (req, res) => {
        res.render("login");
      });
      server.get("/signup", (req, res) => {
        res.render("signup");
      });

      //================================================
      //this time we will configure the data
      var data = []; //this is the main data

      var dataOnGoing = []; //this is for ongoing data
      goingModel.find({}, null).then((docs) => {
        dataOnGoing = docs;
      });

      //===================================================
      //get the main page of rejangpedia
      server.get("/", function (req, res) {
        var filteredData = data.filter(
          (item) =>
            item.Title.toLowerCase().includes("rejang") ||
            item.Title.toLowerCase().includes("bengkulu"),
        ); //filter data for recomended article

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
        } //the loop for data pilihan

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
        } //the loop for the very very random data

        res.render("home", {
          data: filteredData,
          dataPilihan: dataPilihan,
          dataAcak: dataAcak,
        });
      });

      //==============================================
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
      //===============================================
      //now the page for article
      server.get("/details/:id", function (req, res) {
        const theData = data.find((obj) => obj.id === req.params.id); //search the data first
        //==================================
        if (theData === null) {
          res.send("Data tidak ditemukan");
        }
        //==================================
        res.render("details", {
          data: theData,
        });
      });
      server.get("/details/ongoing/:id", function (req, res) {
        const theData = dataOnGoing.find((obj) => obj.id === req.params.id);
        if (theData === null) {
          res.send("Data tidak ditemukan");
        }
        res.render("details", {
          data: theData,
        });
      });
      //=============================================
      server.get("/edit/:id", function (req, res) {
        const theData = data.find((obj) => obj.id === req.params.id); //get the data
        if (theData === null) {
          res.send("Data tidak ditemukan");
        }
        res.render("edit", {
          data: theData,
        });
      });
      server.get("/search", function (req, res) {
        const searchTerm = req.query.term; //get the user input
        const searchResults = data.filter(
          (item) => item.Title.toLowerCase().includes(searchTerm.toLowerCase()), //search the data
        );
        res.render("search-results", {
          results: searchResults,
          searchTerm: searchTerm,
        });
      });

      //===============================================
      server.post("/edit/:id", async function (req, res) {
        const token = req.body["g-recaptcha-response"]; //get the token recaptcha
        const response = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`,
        ); //send axios for token...
        if (!response.data.success)
          return res.json({ msg: "reCAPTCHA tidak valid" });

        const acceptedData = data.find((obj) => obj.id === req.params.id); //search the data first
        const user = req.body;

        if (acceptedData.Pembuat !== null) {
          //if the article maker is not empty
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
        data = data.filter((obj) => obj.id !== req.params.id); //search the data
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
      server.get("/accept/delete/:id", async function (req, res) {
        //if delete dataOnGoing
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

      //==========================================================================
      //Accept the dataOnGoing
      server.get("/accept/:id", async function (req, res) {
        const acceptedData = dataOnGoing.find(
          (obj) => obj.id === req.params.id,
        );

        if (!acceptedData) {
          res.send("Data not found");
          return;
        }

        try {
          if (acceptedData.Image) {
            const uploadResponse = await imagekit.upload({
              file: fs.readFileSync(
                `public/images/uploads/image-${acceptedData.id}.jpg`,
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

          const existingDataIndex = data.findIndex(
            (obj) => obj.id === req.params.id,
          );
          await goingModel
            .deleteOne({ id: req.params.id })
            .then(function () {
              console.log("deleted"); // Success
            })
            .catch(function (error) {
              console.log(error); // Failure
            });
          if (existingDataIndex !== -1) {
            data[existingDataIndex] = acceptedData;
            await mainModel.findOneAndUpdate(
              { id: req.params.id },
              acceptedData,
            );
          } else {
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
          const existingDataIndex = data.findIndex(
            (obj) => obj.id === req.params.id,
          );

          if (existingDataIndex !== -1) {
            // Jika sudah ada, gantilah data di 'data' dengan data yang baru
            data[existingDataIndex] = acceptedData;
            await mainModel.findOneAndUpdate(
              { id: req.params.id },
              acceptedData,
            );
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

      server.post("/new", upload.single("image"), async function (req, res) {
        const token = req.body["g-recaptcha-response"];
        const response = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`,
        );
        if (!response.data.success)
          return res.json({ msg: "reCAPTCHA tidak valid" });

        res.redirect("/");
      });

      //===============================================================
      //Media Social app

      //post to the media social function
      async function post(
        data,
        noteContent,
        noteName,
        noteId,
        color,
        model,
        file,
        res,
      ) {
        try {
          if (noteContent.trim() !== "" && noteName.trim() !== "") {
            //TODO next we will add the post to database first.
            await model.create({
              noteContent,
              noteName,
              noteId,
              color,
              comment: [],
              like: 0,
            });
            data.unshift({
              noteId,
              noteContent,
              noteName,
              like: 0,
              comment: [],
              color,
            });
            shuf = false;
          }
          if (file) {
            const ext =
              file.filename.split(".")[file.filename.split(".").length - 1];
            console.log(file);
            fs.readFile(
              path.join(
                __dirname,
                "/public/images/uploads",
                "image-" + (data.length + 99) + ".jpg",
              ),
              async function (err, data) {
                if (err) throw err; // Fail if the file can't be read.
                await imagekit.upload(
                  {
                    file: data, //required
                    fileName: "image-" + noteId + ".jpg", //required
                    folder: "/RejangConnection",
                    useUniqueFileName: false,
                  },
                  function (error, result) {
                    if (error) console.log(error);
                    else console.log(result);
                  },
                );
              },
            );
            const imageFileName = `image-${data.length + 99}.jpg`;
            const imageFilePath = path.join(
              __dirname,
              "/public/images/uploads",
              imageFileName,
            );
            if (fs.existsSync(imageFilePath)) {
              fs.unlinkSync(imageFilePath);
            }
          }
        } catch (err) {
          console.error(err);
        }
        res.redirect("/chat");
      }
      //==================
      var dataSocial = []; //the social media data post

      function shuffleOnClient(data) {
        return data;
      }
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

      //for the share feature
      server.get("/chat/share/:noteId", function (req, res) {
        const noteIdGet = req.params.noteId.trim();
        const itemIndex = dataSocial.findIndex(
          ({ noteId }) => noteId == noteIdGet,
        ); //search the data and go details

        res.render("detailsSocial", {
          element: dataSocial[itemIndex],
        });
      });

      //it for user details
      server.get("/chat/:noteId", function (req, res) {
          const usernameToFind = req.params.noteId.trim();

          // Find the user in the users array based on the username
          const user = users.find(({ username, id }) => id === usernameToFind || username === usernameToFind );

          if (user) {
              // If the user is found, use their id to filter dataSocial
            const matchingItems = dataSocial.filter(({ noteName }) => noteName === user.id || noteName === usernameToFind);

              res.render("user", {
                  data: matchingItems,
                  userData: user,
              });
          } else {
              // Handle the case where the user is not found
              res.status(404).send("User not found");
          }
      });

      //==============================================
      //for add the new post
      server.post("/chat", uploadSocial.single("image"), async (req, res) => {
        const token = req.body["g-recaptcha-response"];
        const response = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`,
        );
        if (!response.data.success)
          return res.json({ msg: "reCAPTCHA tidak valid" });
        //TODO first things, we will make the const variable from the req data
        const noteContent = req.body.noteContent;
        const noteName = req.body.noteName;
        const noteId = uuidv1();
        const noteColor = req.body.noteColor;
        const file = req.file;

        //TODO then call the function
        await post(
          dataSocial,
          noteContent,
          noteName,
          noteId,
          noteColor,
          socialModel,
          file,
          res,
        ); //call the post function we made before
      });

      //=================================================================================
      //add new comment
      server.post("/chat/comment/:noteId", async (req, res) => {
        const commentContent = req.body.commentContent;
        const commenterName = req.body.commenterName;
        const noteIdPost = req.params.noteId;
        const commentID = dataSocial.length + 50;
        const itemIndex = dataSocial.findIndex(
          ({ noteId }) => noteId == noteIdPost,
        );

        await socialModel.findOneAndUpdate(
          { noteId: noteIdPost },
          {
            $push: {
              comment: { commentContent, commentId: commentID, commenterName },
            },
          },
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

      //Edit Profile
      server.get("/edit-profile/:id", (req, res) => {
        const acceptedData = users.findIndex((obj) => obj.id === req.params.id); //search the data first
        res.render("profile-edit", {
          data: users[acceptedData]
        })
      }); //get the edit profile page

      server.post("/edit-profile/:id", async (req, res) => {
          try {
              // Edit Profile will be here
              const acceptedData = users.findIndex((obj) => obj.id === req.params.id); // search the data first
              const user = req.body;
              if(user.password === users[acceptedData].password){
                users[acceptedData].username = user.username;
              users[acceptedData].password = user.password;
              users[acceptedData].desc = user.desc;

              await userModel.findOneAndUpdate(
                  { id: req.params.id },
                  { $set: user }, // Use $set to update the fields
                  { new: true } // Return the updated document
              );
              }

              

              res.redirect(`/chat/${req.params.id}`);
          } catch (error) {
              // Handle errors appropriately
              console.error(error);
              res.status(500).send("Internal Server Error");
          }
      }); // Edit Profile Feature

/*\

*/
      //==============================================
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

//Finish, the code is made by M.Fathin Halim
