import React from "react";
import { getDatabase, ref, onValue, get, set } from "firebase/database";
import VoteAvatars from "../VoteAvatars/VoteAvatars"; // Importando o componente VoteAvatars

import "./VoteSection.scss";

const VoteSection = ({ user }) => {
  const [categories, setCategories] = React.useState([]);
  const [users, setUsers] = React.useState({}); // Para armazenar os dados dos usuários

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

      {categories.map((category) => (
        <div
          key={category.name}
          className="d-flex flex-column align-items-start text-left gap-3 w-100"
        >
          <h3>{category.name}</h3>
          <p>{category.description}</p>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            {category.options.map((option, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center w-100"
              >
                <button
                  className="option-button d-flex align-items-center justify-content-between gap-2"
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VoteSection;
