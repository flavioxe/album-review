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

  // Obter o mês e ano atuais
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  return (
    <section className={`w-100`}>
      {months.map((month, index) => {
        // Criar a chave correspondente ao mês e ano
        const monthYearKey = new Date(selectedYear, 11 - index).toLocaleString(
          "default",
          { month: "long", year: "numeric" }
        );

        // Verificar se o mês é futuro
        const isFutureMonth =
          selectedYear > currentYear ||
          (selectedYear === currentYear && 11 - index > currentMonth);

        return (
          <section key={index} className={isFutureMonth ? "d-none" : ""}>
            <p className="text-left">{month}</p>

            <div className="album-grid pb-3">
              {albums[monthYearKey] && albums[monthYearKey].length > 0
                ? albums[monthYearKey].map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))
                : !isFutureMonth && (
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
