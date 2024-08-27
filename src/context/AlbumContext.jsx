import React, { createContext, useState, useContext, useEffect } from "react";
import albumsData from "../../albums.json"; // Importa os dados do arquivo JSON

const AlbumContext = createContext();

export const useAlbum = () => {
  return useContext(AlbumContext);
};

export const AlbumProvider = ({ children }) => {
  const [albums, setAlbums] = useState([]);

  // Carrega os álbuns do arquivo JSON ao inicializar o contexto
  useEffect(() => {
    setAlbums(albumsData); // Inicializa com os dados do arquivo JSON
  }, []);

  const addAlbum = (newAlbum) => {
    setAlbums((prevAlbums) => [...prevAlbums, newAlbum]); // Adiciona o novo álbum
  };

  return (
    <AlbumContext.Provider value={{ albums, addAlbum }}>
      {children}
    </AlbumContext.Provider>
  );
};
