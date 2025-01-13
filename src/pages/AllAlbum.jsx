import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import Month from "../components/Month/Month";

export default function AllAlbum() {
  const [albumsByMonth, setAlbumsByMonth] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const database = getDatabase();

  // Function to fetch albums from Firebase
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

  // Function to group albums by month
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

    // Sort albums within each month by release date (most recent first)
    Object.keys(groupedAlbums).forEach((month) => {
      groupedAlbums[month].sort(
        (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
      );
    });

    return groupedAlbums;
  };

  // Function to filter albums by selected year
  const filterAlbumsByYear = (albums) => {
    const filtered = Object.keys(albums).reduce((acc, month) => {
      const filteredAlbums = albums[month].filter((album) => {
        const releaseDate = new Date(album.releaseDate);
        return releaseDate.getFullYear() === selectedYear;
      });

      if (filteredAlbums.length > 0) {
        acc[month] = filteredAlbums;
      }

      return acc;
    }, {});

    return filtered;
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  // Handle year selection change
  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  // Get filtered albums based on the selected year
  const filteredAlbumsByMonth = filterAlbumsByYear(albumsByMonth);

  return (
    <main className="d-flex flex-column align-items-start gap-3">
      <HeaderPages text="Todas as reviews" />

      {/* Year selection dropdown */}
      <div className="d-flex align-items-center justify-content-between w-100">
        <h3>Reviews de {selectedYear}</h3>

        <div>
          <label htmlFor="yearSelect" className="form-label">
            Selecione o Ano:
          </label>
          <select
            id="yearSelect"
            className="form-select cursor-pointer"
            value={selectedYear}
            onChange={handleYearChange}
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
      </div>

      {/* Display albums for the selected year */}
      <Month albums={filteredAlbumsByMonth} selectedYear={selectedYear} />
    </main>
  );
}
