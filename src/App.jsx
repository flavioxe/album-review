import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AddAlbum from "./pages/AddAlbum";
import AlbumReview from "./pages/AlbumReview";
import { AlbumProvider } from "./context/AlbumContext"; // Ajuste o caminho conforme necessário

export default function App() {
  return (
    <AlbumProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-album" element={<AddAlbum />} />
          <Route path="/album-review/:id" element={<AlbumReview />} />
        </Routes>
      </Router>
    </AlbumProvider>
  );
}
