const express = require("express");
const axios = require("axios");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

// Route untuk halaman utama
app.get("/details/:konten", async (req, res) => {
  try {
    // Judul artikel Wikipedia yang akan diambil
    const articleTitle = req.params.konten; // Ganti dengan judul artikel yang diinginkan

    // URL untuk mengakses API Wikipedia
    const apiUrl = `https://id.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${encodeURIComponent(
      articleTitle
    )}&exintro=true&formatversion=2`;

    // Lakukan permintaan ke API Wikipedia
    const response = await axios.get(apiUrl);

    // Ambil data artikel dan gambar dari respons API
    const page = response.data.query.pages[0];
    const articleData = {
      title: page.title,
      content: page.extract,
      image: page.thumbnail?.source || null,
    };

    // Render tampilan menggunakan EJS
    res.render("index", { articleData });
  } catch (error) {
    console.error("Error fetching data from Wikipedia API:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
