---
name: importacao-albuns-spotify
description: 'Use when implementing Spotify album search/import in React + Firebase projects: secure API proxy, Spotify search with pagination, import modal, and Firestore persistence matching manual album schema without regressions.'
argument-hint: 'Informe rota de cadastro manual, colecao Firestore e arquivo da Home para integrar o toggle de busca.'
---

# Skill: Importacao de Albuns via Spotify API

## Quando usar esta skill
Use esta skill quando o objetivo for adicionar busca/importacao de albuns do Spotify em um app React + Firebase existente, preservando estrutura de dados e fluxo atual de cadastro/avaliacao.

## Resultado esperado
Ao final, o projeto deve permitir:
- Buscar albuns no Spotify com proxy seguro no backend.
- Exibir resultados com paginacao incremental.
- Abrir modal de confirmacao com detalhes do album.
- Persistir no Firestore com a mesma estrutura do cadastro manual.
- Manter consistencia visual e funcional com o app existente.

## Regras obrigatorias
- Nunca expor SPOTIFY_CLIENT_SECRET no frontend.
- Usar fetch nativo (nao usar axios).
- Nao adicionar bibliotecas de UI.
- Nao alterar estrutura de colecoes/campos do Firestore ja em uso.
- Reaproveitar padroes visuais e variaveis SCSS existentes.
- Garantir que .env permaneca fora de commits.

## Etapa 0 - Leitura obrigatoria (antes de codar)
Ler integralmente:
- src/pages/ (identificar Home e cadastro manual)
- src/components/AlbumForm/*
- src/components/AlbumCard/AlbumCard.jsx e AlbumCard.scss
- src/components/AlbumHeader/*
- src/firebase.js
- src/hooks/*
- src/styles/*
- server.js
- vite.config.js
- .env (sem expor valores)
- package.json

Mapear antes de codar:
- Como o album e salvo no Firestore hoje (colecao, campos, funcao, defaults).
- Convencao de classes SCSS e uso de variaveis.
- Estrategia de roteamento e rotas para cadastro manual.
- Padrao visual geral (cores, tipografia, botoes, cards, overlays).

Gate obrigatorio antes da Etapa 1:
- Registrar explicitamente (na resposta de trabalho) colecao, campos, defaults e funcao exata usada no cadastro manual.
- Nao iniciar implementacao enquanto esse mapeamento nao estiver completo.

## Etapa 1 - Proxy seguro Spotify (backend)
Objetivo: centralizar autenticacao Client Credentials no servidor.

### Decisao
- Se server.js existir no projeto: adicionar rotas nele obrigatoriamente.
- So usar function serverless em api/spotify.js se server.js estiver ausente.

### Implementacao
Implementar endpoints:

1) GET /api/spotify/search
- Query params: q, offset=0, limit=5
- Fluxo:
  - Obter token via POST https://accounts.spotify.com/api/token
  - Header Authorization Basic base64(CLIENT_ID:CLIENT_SECRET)
  - Body grant_type=client_credentials
  - Cachear token em memoria ate expirar (expires_in)
  - Chamar GET https://api.spotify.com/v1/search (type=album)
  - Retornar somente: id, name, artistName, releaseDate, coverUrl

2) GET /api/spotify/album/:id
- Fluxo:
  - Reusar token cacheado ou renovar
  - Chamar GET https://api.spotify.com/v1/albums/{id}
  - Retornar: id, name, artistName, releaseDate, coverUrl, tracks[{ titulo, duracaoMs }]

### Erros
- Responder com status HTTP apropriado e payload claro.
- Diferenciar erro de validacao, upstream (Spotify), e erro interno.

### Variaveis de ambiente
Adicionar no .env (sem prefixo VITE_):
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET

Se faltar proxy no Vite para dev, configurar /api no vite.config.js.

## Etapa 2 - Utilitario de cor dominante
Criar src/utils/extractColor.js usando color-thief-browser.
- Resolver para HEX no formato #rrggbb.
- Fallback seguro para #1a1a1a em qualquer erro.

## Etapa 3 - Servico frontend Spotify
Criar src/services/spotifyService.js com:
- searchAlbums(query, offset = 0)
- getAlbumDetails(spotifyId)

Requisitos:
- Usar fetch.
- Tratar response nao-ok com mensagens claras.
- Retornar dados ja prontos para consumo no hook/componente.

## Etapa 4 - Hook de busca
Criar src/hooks/useSpotifySearch.js expondo:
- query, setQuery
- results
- isLoading
- error
- hasMore
- loadMore()
- reset()
- search(q)

Comportamentos:
- Debounce de 500ms para busca automatica com 3+ caracteres.
- reset automatico quando query for string vazia.
- loadMore concatena resultados, incrementa offset.
- hasMore=false quando retorno vier com menos de 5 itens.

## Etapa 5 - Componente SpotifySearch
Criar:
- src/components/SpotifySearch/SpotifySearch.jsx
- src/components/SpotifySearch/SpotifySearch.scss

Requisitos:
- Input placeholder Buscar album no Spotify...
- Botao Pesquisar no Spotify
- Botao Adicionar manualmente (navega para rota de cadastro manual)
- Lista de resultados em cards (capa, album, artista)
- Botao Exibir mais quando aplicavel
- Clique no card abre modal com detalhes
- Debounce/limpeza de estado conforme hook

Visual:
- Reusar variaveis SCSS e padroes de botoes/inputs/cards existentes.
- Posicionar abaixo dos botoes principais da Home.

## Etapa 6 - Modal de importacao
Criar:
- src/components/SpotifyAlbumModal/SpotifyAlbumModal.jsx
- src/components/SpotifyAlbumModal/SpotifyAlbumModal.scss

Props:
- album
- onClose

UI:
- Overlay clicavel para fechar.
- Header com cor primaria extraida da capa.
- Loader enquanto extrai cor.
- Corpo com data, input de genero opcional, lista de faixas (mm:ss).
- Footer com Cancelar e Adicionar a plataforma.
- Responsivo com scroll interno.

Fluxo de salvar:
1. Mostrar loading.
2. Extrair cor dominante.
3. Ler estrutura exata do cadastro manual.
4. Montar objeto com mesmos campos e defaults do fluxo manual.
5. Salvar na mesma colecao e funcao usada hoje.
6. Sucesso: feedback e onClose.
7. Erro: mostrar mensagem e manter modal aberto.

## Etapa 7 - Integracao na Home
- Alterar botao + Novo registro para toggle do SpotifySearch.
- Componente aparece logo abaixo dos botoes principais.
- Estado visivel pode alterar texto para Fechar busca ou estilo ativo.
- Animacao suave de abertura/fechamento sem quebrar layout.
- Botao Adicionar manualmente dentro do SpotifySearch navega para cadastro manual.

## Etapa 8 - Checklist de verificacao
Validar obrigatoriamente:
- SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET em .env e .env ignorado no git.
- color-thief-browser instalado.
- /api/spotify/search funcional localmente.
- Busca automatica (3+ chars) com debounce.
- Busca manual para queries curtas.
- Exibir mais paginando sem limpar lista.
- Reset ao limpar input.
- Modal com cor extraida da capa.
- Lista de musicas com duracao correta.
- Persistencia no Firestore identica ao cadastro manual.
- Album novo aparece e entra no fluxo normal de avaliacao.
- Nenhuma regressao em funcionalidades existentes.
- Visual consistente com o restante da plataforma.
- Variaveis em producao configuradas no provedor de deploy.

## Criterios de conclusao
A skill so esta concluida quando:
- Todos os itens do checklist passarem.
- Nao houver exposicao de segredo no frontend.
- O schema persistido for indistinguivel do cadastro manual.

## Prompt de invocacao sugerido
Implemente a skill Importacao de Albuns via Spotify API neste projeto, seguindo todas as etapas, sem alterar o schema do Firestore e sem quebrar o visual atual.
