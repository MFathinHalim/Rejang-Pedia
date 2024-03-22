import "./index.css";
import Navbar from "./Navbar.jsx";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Gunakan createRoot untuk merender aplikasi
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Navbar />
    <App />
  </React.StrictMode>
);
