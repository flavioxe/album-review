import React from "react";
import AlbumCard from "../AlbumCard/AlbumCard";
import DivisionMark from "../DivisionMark/DivisionMark";

export default function Month({ albums, selectedYear }) {
  // Lista dos meses do ano em ordem reversa
  const months = [
    "Dezembro",
    "Novembro",
    "Outubro",
    "Setembro",
    "Agosto",
    "Julho",
    "Junho",
    "Maio",
    "Abril",
    "Março",
    "Fevereiro",
    "Janeiro",
  ];

  return (
    <section className={`w-100`}>
      {months.map((month, index) => {
        // Criar a chave correspondente ao mês e ano
        const monthYearKey = new Date(selectedYear, 11 - index).toLocaleString(
          "default",
          { month: "long", year: "numeric" }
        );

        return (
          <section key={index}>
            <p className="text-left">{month}</p>

            <div className="album-grid pb-3">
              {albums[monthYearKey] && albums[monthYearKey].length > 0 ? (
                albums[monthYearKey].map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))
              ) : (
                <small className="text-left">Sem novidades 👎🏾</small>
              )}
            </div>
            <DivisionMark />
          </section>
        );
      })}
    </section>
  );
}
