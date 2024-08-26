import React, { useState } from "react";
import AlbumForm from "../components/AlbumForm"; // Ajuste o caminho conforme necessário

function AddAlbum() {
  const [albums, setAlbums] = useState([]);

  const handleAddAlbum = (newAlbum) => {
    setAlbums((prevAlbums) => [...prevAlbums, newAlbum]);
    console.log("Novo álbum adicionado:", newAlbum);
  };

  return (
    <div>
      <h1>Adicionar Álbum</h1>
      <AlbumForm onAddAlbum={handleAddAlbum} />
      <h2>Álbuns Cadastrados</h2>
      <ul>
        {albums.map((album) => (
          <li key={album.id}>
            {album.name} - {album.artist}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddAlbum;
