import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Home from "./pages/Home";
import AddAlbum from "./pages/AddAlbum";
import AllAlbum from "./pages/AllAlbum";
import AlbumReview from "./pages/AlbumReview";
import EditAlbum from "./pages/EditAlbum";
import RateAlbum from "./pages/RateAlbum";
import GrammyBet from "./pages/GrammyBet";
import Login from "./pages/Login";
import EditProfile from "./pages/EditProfile";
import { AlbumProvider } from "./context/AlbumContext";

import "bootstrap/dist/css/bootstrap.min.css";
import FooterComopnent from "./components/Footer/FooterComponent";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AlbumProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Home user={user} onLogout={handleLogout} />}
          />{" "}
          {/* Passando user e onLogout como prop */}
          <Route path="/add-album" element={<AddAlbum />} />
          <Route path="/all-albums" element={<AllAlbum />} />
          <Route path="/album-review/:id" element={<AlbumReview />} />
          <Route path="/edit-album/:id" element={<EditAlbum />} />
          <Route path="/rate-album/:id" element={<RateAlbum />} />
          <Route
            path="/edit-profile"
            element={user ? <EditProfile user={user} /> : <Navigate to="/" />}
          />
          {/* Rota para o bolão do Grammy */}
          <Route
            path="/grammy-bet"
            element={user ? <GrammyBet user={user} /> : <Navigate to="/" />}
          />
          {/* Rota de autenticação */}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/grammy-bet" /> : <Login setUser={setUser} />
            }
          />
        </Routes>
      </Router>

      <FooterComopnent user={user} onLogout={handleLogout} />
    </AlbumProvider>
  );
}
