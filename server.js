import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors"; // Importa o middleware CORS

const app = express();
const PORT = 5000;

app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json());

const jsonFilePath = path.join(process.cwd(), "albums.json");

// Rota para obter todos os álbuns
app.get("/albums", (req, res) => {
  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Erro ao ler o arquivo");
    }
    res.json(JSON.parse(data));
  });
});

// Rota para adicionar um novo álbum
app.post("/albums", (req, res) => {
  const newAlbum = req.body;

  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Erro ao ler o arquivo");
    }

    const albums = JSON.parse(data);
    albums.push(newAlbum);

    fs.writeFile(jsonFilePath, JSON.stringify(albums, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Erro ao salvar o arquivo");
      }
      res.status(201).json(newAlbum);
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
