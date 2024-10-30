import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AddAlbum from "./pages/AddAlbum";
import AllAlbum from "./pages/AllAlbum";
import AlbumReview from "./pages/AlbumReview";
import RateAlbum from "./pages/RateAlbum";
import { AlbumProvider } from "./context/AlbumContext"; // Ajuste o caminho conforme necessário

import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <AlbumProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-album" element={<AddAlbum />} />
          <Route path="/all-albums" element={<AllAlbum />} />
          <Route path="/album-review/:id" element={<AlbumReview />} />
          <Route path="/rate-album/:id" element={<RateAlbum />} />
        </Routes>
      </Router>
    </AlbumProvider>
  );
}
