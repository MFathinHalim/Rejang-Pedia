module.exports = function (server, users, userModel) {
  // Route to handle user signup
  server.post("/signup", async (req, res) => {
    const { username, password, desc } = req.body;

    // Check if the username is already taken
    const isUsernameTaken = users.some((user) => user.username === username);
    if (isUsernameTaken) {
      return res.send(
        "Maaf, username tersebut sudah ada. Anda bisa menambahkan angka atau kata lain untuk membuat username Anda unik. <a href='/signup' > Kembali </a>"
      );
    }

    // Add user to MongoDB
    await userModel.create({
      id: username,
      username: username,
      password: password,
      desc: desc,
      atmin: false,
    });

    // Add user to local array
    users.push({
      id: username,
      username: username,
      password: password,
      desc: desc,
    });

    // Redirect to the login page
    return res.redirect("/login");
  });

  // Route to handle user login
  server.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if the username and password are correct
    const userIndex = users.findIndex(
      (u) => u.username === username && u.password === password
    );

    if (userIndex !== -1) {
      // If credentials are correct, render the success page
      return res.render("success", {
        user: users[userIndex].username,
        id: users[userIndex].id,
        atmin: users[userIndex].atmin,
      });
    } else {
      // If credentials are wrong, display an error message
      return res.send("Password Salah");
    }
  });

  // Route to render the login page
  server.get("/login", (req, res) => {
    res.render("login");
  });

  // Route to render the signup page
  server.get("/signup", (req, res) => {
    res.render("signup");
  });
};
