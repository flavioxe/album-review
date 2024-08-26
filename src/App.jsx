import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AddAlbum from "./pages/AddAlbum";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-album" element={<AddAlbum />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
