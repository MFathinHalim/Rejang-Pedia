import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/index.jsx";
import Details from "./pages/details.jsx";
import Database from "./pages/database.jsx";
import NewArticle from "./pages/new.jsx";
import EditArticle from "./pages/edit.jsx";
import Search from "./pages/search-result.jsx";
import Tentang from "./pages/tentang.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="details/:id" element={<Details />} />
        <Route path="edit/:id" element={<EditArticle />} />
        <Route path="data" element={<Database />} />
        <Route path="new" element={<NewArticle />} />
        <Route path="search" element={<Search />} />
        <Route path="tentang" element={<Tentang />} />
      </Routes>
    </Router>
  );
};

export default App;
