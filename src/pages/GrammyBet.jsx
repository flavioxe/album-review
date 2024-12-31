// GrammyBet.js
import React from "react";
import CategoryForm from "../components/CategoryForm/CategoryForm";
import VoteSection from "../components/VoteSection/VoteSection";
import HeaderPages from "../components/HeaderPages/HeaderPages";

const GrammyBet = ({ user }) => {
  const handleCategoryAdded = () => {
    // Lógica para atualizar a lista de categorias se necessário
    alert("Nova categoria adicionada.");
  };

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100">
      <HeaderPages text="Bolão do Grammy" />

      {/* Apenas usuários logados podem cadastrar novas categorias */}
      {user && <CategoryForm onCategoryAdded={handleCategoryAdded} />}
      {/* Se o usuário estiver logado ou não, exibe a seção de votação */}
      <VoteSection user={user} />
    </section>
  );
};

export default GrammyBet;
