import React from "react";
import { getDatabase, ref, onValue, get, set } from "firebase/database";
import VoteAvatars from "../VoteAvatars/VoteAvatars";
import EditCategoryOptions from "../CategoryForm/EditCategoryOptions";
import { CaretDown } from "phosphor-react";
import CategoryForm from "../CategoryForm/CategoryForm";
import "./VoteSection.scss";

const VoteSection = ({ user }) => {
  const [categories, setCategories] = React.useState([]);
  const [users, setUsers] = React.useState({}); // Para armazenar os dados dos usuários
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [openCategories, setOpenCategories] = React.useState({});
  const toggleCategoryAccordion = (name) =>
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  const [openCreateAccordion, setOpenCreateAccordion] = React.useState(false);
  const toggleCreateAccordion = () => setOpenCreateAccordion((prev) => !prev);

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

      {user && (
        <div className="accordion-item w-100 border border-black">
          <button
            type="button"
            className="accordion-header d-flex align-items-center justify-content-between w-100"
            onClick={toggleCreateAccordion}
          >
            <span>
              <strong>Cadastrar categoria</strong>
            </span>
            <CaretDown
              size={18}
              className={
                openCreateAccordion ? "accordion-caret open" : "accordion-caret"
              }
            />
          </button>

          {openCreateAccordion && (
            <div className="accordion-content">
              <CategoryForm
                onCategoryAdded={() => setOpenCreateAccordion(false)}
              />
            </div>
          )}
        </div>
      )}

      {categories.map((category) => {
        const isCoverCategory =
          typeof category.name === "string" &&
          (category.name.toLowerCase().includes("best album cover") ||
            category.name.includes("(78)"));
        const isHidden = !!category.hidden;
        if (isHidden && !user) return null;

        const isOpen = !!openCategories[category.name];

        return (
          <div
            key={category.name}
            className="accordion-item w-100 border border-black"
          >
            <button
              type="button"
              className="accordion-header d-flex align-items-center justify-content-between w-100"
              onClick={() => toggleCategoryAccordion(category.name)}
            >
              <div className="d-flex flex-column align-items-start text-left">
                <h3 className="mb-1">{category.name}</h3>
                {category.description && <small>{category.description}</small>}
                {isHidden && (
                  <small className="text-muted">Categoria escondida</small>
                )}
              </div>
              <CaretDown
                size={18}
                className={isOpen ? "accordion-caret open" : "accordion-caret"}
              />
            </button>

            {isOpen && (
              <div className="accordion-content d-flex flex-column align-items-start gap-2 w-100">
                {!isHidden && (
                  <div
                    className={
                      isCoverCategory
                        ? "cover-grid w-100"
                        : "d-flex flex-column align-items-start gap-1 w-100"
                    }
                  >
                    {category.options.map((option, index) =>
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
                              <VoteAvatars
                                userIds={Object.keys(option.votes)}
                              />
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
                            {option.votes && (
                              <VoteAvatars
                                userIds={Object.keys(option.votes)}
                              />
                            )}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {user && (
                  <div className="d-flex flex-column align-items-start gap-2 w-100">
                    <div className="d-flex align-items-center gap-2">
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

                    <button
                      type="button"
                      className="accordion-subheader d-flex align-items-center justify-content-between w-100"
                      onClick={() =>
                        setEditingCategory(
                          editingCategory === category.name
                            ? null
                            : category.name
                        )
                      }
                    >
                      <span>{`Editar opções de ${category.name}`}</span>
                      <CaretDown
                        size={16}
                        className={
                          editingCategory === category.name
                            ? "accordion-caret open"
                            : "accordion-caret"
                        }
                      />
                    </button>

                    {editingCategory === category.name && (
                      <div className="accordion-content">
                        <EditCategoryOptions
                          category={category}
                          onClose={() => setEditingCategory(null)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VoteSection;
