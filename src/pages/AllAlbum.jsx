import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import Month from "../components/Month/Month";

export default function AllAlbum() {
  const [albumsByMonth, setAlbumsByMonth] = useState({});

  const navigate = useNavigate();
  const database = getDatabase();

  // Função para buscar álbuns do Firebase
  const fetchAlbums = () => {
    const albumsRef = ref(database, "albums");
    onValue(albumsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const albumsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAlbumsByMonth(groupAlbumsByMonth(albumsArray));
      } else {
        setAlbumsByMonth({});
      }
    });
  };

  // Função para agrupar álbuns por mês
  const groupAlbumsByMonth = (albumsArray) => {
    const groupedAlbums = {};

    albumsArray.forEach((album) => {
      const releaseDate = new Date(album.releaseDate);
      const monthYearKey = releaseDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!groupedAlbums[monthYearKey]) {
        groupedAlbums[monthYearKey] = [];
      }
      groupedAlbums[monthYearKey].push(album);
    });

    // Ordenar os álbuns dentro de cada mês por data de lançamento (mais recente primeiro)
    Object.keys(groupedAlbums).forEach((month) => {
      groupedAlbums[month].sort(
        (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
      );
    });

    return groupedAlbums;
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <main className="d-flex flex-column align-items-start gap-5">
      <HeaderPages text="Todas as reviews" />
      <Month albums={albumsByMonth} />
    </main>
  );
}
