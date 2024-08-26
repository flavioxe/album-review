// src/pages/AddAlbum.jsx

import { useNavigate } from "react-router-dom";
import AlbumForm from "../components/AlbumForm";

export default function AddAlbum({ onAddAlbum }) {
  const navigate = useNavigate();

  const handleAddAlbum = (newAlbum) => {
    onAddAlbum(newAlbum); // Chama a função passada como prop para adicionar o álbum
    navigate("/"); // Redireciona para a página inicial após adicionar o álbum
  };

  return (
    <div>
      <h1>Cadastrar Novo Álbum</h1>
      <AlbumForm onAddAlbum={handleAddAlbum} />
    </div>
  );
}
