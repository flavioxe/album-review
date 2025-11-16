import React from "react";
import { getDatabase, ref, onValue, get, set } from "firebase/database";
import VoteAvatars from "../VoteAvatars/VoteAvatars"; // Importando o componente VoteAvatars
import EditCategoryOptions from "../CategoryForm/EditCategoryOptions";

import "./VoteSection.scss";

const VoteSection = ({ user }) => {
  const [categories, setCategories] = React.useState([]);
  const [users, setUsers] = React.useState({}); // Para armazenar os dados dos usuários
  const [editingCategory, setEditingCategory] = React.useState(null);

  const toggleHidden = async (categoryName, nextHidden) => {
    const db = getDatabase();
    const catRef = ref(db, `categories/${categoryName}/hidden`);
    await set(catRef, nextHidden);
  };

  const resetCategoryVotes = async (categoryName) => {
    if (!user) return;
    const db = getDatabase();
    const allOptionsRef = ref(db, `categories/${categoryName}/options`);
    const allOptionsSnapshot = await get(allOptionsRef);
    const allOptionsData = allOptionsSnapshot.val();

    if (!allOptionsData || !Array.isArray(allOptionsData)) {
      alert("Nenhuma opção encontrada para esta categoria.");
      return;
    }

    for (let i = 0; i < allOptionsData.length; i++) {
      await set(ref(db, `categories/${categoryName}/options/${i}/votes`), null);
    }

    alert(`Votos resetados para a categoria ${categoryName}.`);
  };

  React.useEffect(() => {
    const db = getDatabase();

    // Carregar categorias
    const categoriesRef = ref(db, "categories");
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesArray = Object.keys(data).map((key) => ({
          name: key,
          ...data[key],
        }));

        // Ordenar categorias pelo parâmetro 'order'
        categoriesArray.sort((a, b) => (a.order || 0) - (b.order || 0));

        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
    });

    // Carregar usuários
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(data); // Armazena todos os dados dos usuários em um único objeto
      }
    });
  }, []);

  const handleVote = async (categoryName, optionIndex) => {
    if (!user) return; // Se não estiver logado

    const db = getDatabase();

    // Referência à opção onde o voto será registrado
    const optionRef = ref(
      db,
      `categories/${categoryName}/options/${optionIndex}`
    );

    // Faz uma leitura única da opção
    const optionSnapshot = await get(optionRef);
    const optionData = optionSnapshot.val();

    // Verifica se já existe um campo "votes" para a opção
    let currentVotes = optionData?.votes || {};

    // Se o usuário já votou em outra opção, remova seu voto anterior
    if (currentVotes[user.uid]) {
      // Remove o voto da opção atual
      await set(
        ref(
          db,
          `categories/${categoryName}/options/${optionIndex}/votes/${user.uid}`
        ),
        null
      );
    } else {
      // Se o usuário já votou em outra opção, percorra todas as opções para remover seu voto anterior
      const allOptionsRef = ref(db, `categories/${categoryName}/options`);
      const allOptionsSnapshot = await get(allOptionsRef);
      const allOptionsData = allOptionsSnapshot.val();

      for (let i = 0; i < allOptionsData.length; i++) {
        if (allOptionsData[i].votes && allOptionsData[i].votes[user.uid]) {
          // Remove o voto da opção anterior
          await set(
            ref(
              db,
              `categories/${categoryName}/options/${i}/votes/${user.uid}`
            ),
            null
          );
          break; // Sai do loop após remover o voto
        }
      }
    }

    // Adiciona o ID do usuário à nova opção
    await set(
      ref(
        db,
        `categories/${categoryName}/options/${optionIndex}/votes/${user.uid}`
      ),
      true
    );

    alert(
      `Você votou na opção ${optionIndex + 1} da categoria ${categoryName}`
    );
  };

  return (
    <div className="d-flex flex-column align-items-start gap-3 w-100">
      <p className="mb-2">
        <strong>Categorias para votação</strong>
      </p>

      {categories.map((category) => {
        const isCoverCategory =
          typeof category.name === "string" &&
          (category.name.toLowerCase().includes("best album cover") ||
            category.name.includes("(78)"));
        const isHidden = !!category.hidden;
        if (isHidden && !user) return null;

        return (
          <div
            key={category.name}
            className="d-flex flex-column align-items-start text-left gap-3 w-100"
          >
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            {isHidden && <small className="text-muted">Categoria escondida</small>}

            {!isHidden && (
              <div
                className={
                  isCoverCategory
                    ? "cover-grid w-100"
                    : "d-flex flex-column align-items-start gap-1 w-100"
                }
              >
                {category.options.map((option, index) => (
                  isCoverCategory ? (
                    <button
                      key={index}
                      className="option-button cover-option d-flex flex-column align-items-start gap-2 w-100"
                      onClick={() => handleVote(category.name, index)}
                    >
                      {option.image && (
                        <img
                          src={option.image}
                          alt={`Capa ${index + 1}`}
                          className="cover-image-square"
                        />
                      )}
                      {option.text && (
                        <span className="cover-caption">{option.text}</span>
                      )}
                      {option.votes && (
                        <div className="w-100 d-flex justify-content-end">
                          <VoteAvatars userIds={Object.keys(option.votes)} />
                        </div>
                      )}
                    </button>
                  ) : (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center w-100"
                    >
                      <button
                        className="option-button d-flex align-items-center justify-content-between gap-2 w-100"
                        onClick={() => handleVote(category.name, index)}
                      >
                        <div className="d-flex align-items-center mb-0 gap-3">
                          {option.image && (
                            <img
                              src={option.image}
                              alt={`Opção ${index + 1}`}
                              className="preview-image"
                            />
                          )}
                          <span>{option.text}</span>
                        </div>
                        {/* Exibir avatares dos usuários que votaram */}
                        {option.votes && (
                          <VoteAvatars userIds={Object.keys(option.votes)} />
                        )}
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}

            {user && (
              <div className="d-flex align-items-center gap-2">
                {editingCategory === category.name ? (
                  <button
                    type="button"
                    className="button-outline"
                    onClick={() => setEditingCategory(null)}
                  >
                    Fechar edição
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setEditingCategory(category.name)}
                  >
                    {`Editar opções de ${category.name}`}
                  </button>
                )}

                <button
                  type="button"
                  className="button-outline"
                  onClick={() => resetCategoryVotes(category.name)}
                >
                  Resetar votos
                </button>

                <button
                  type="button"
                  className="button-outline"
                  onClick={() => toggleHidden(category.name, !isHidden)}
                >
                  {isHidden ? "Mostrar categoria" : "Esconder categoria"}
                </button>
              </div>
            )}

            {editingCategory === category.name && (
              <EditCategoryOptions
                category={category}
                onClose={() => setEditingCategory(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VoteSection;
