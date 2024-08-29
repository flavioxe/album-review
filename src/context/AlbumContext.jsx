import React, { createContext, useState, useContext, useEffect } from "react";

const AlbumContext = createContext();

export const useAlbum = () => {
  return useContext(AlbumContext);
};

export const AlbumProvider = ({ children }) => {
  const [albums, setAlbums] = useState([]);

  const addAlbum = (newAlbum) => {
    setAlbums((prevAlbums) => [...prevAlbums, newAlbum]); // Adiciona o novo álbum
  };

  return (
    <AlbumContext.Provider value={{ albums, addAlbum }}>
      {children}
    </AlbumContext.Provider>
  );
};
