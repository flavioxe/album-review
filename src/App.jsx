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
import RateAlbum from "./pages/RateAlbum";
import GrammyBet from "./pages/GrammyBet"; // Importando a nova página do bolão
import Login from "./pages/Login"; // Importando a nova página de login
import { AlbumProvider } from "./context/AlbumContext"; // Ajuste o caminho conforme necessário

import "bootstrap/dist/css/bootstrap.min.css";

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
          <Route path="/rate-album/:id" element={<RateAlbum />} />
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

        {/* Exibir botão de logout se o usuário estiver autenticado */}
        {user && (
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        )}
      </Router>
    </AlbumProvider>
  );
}
