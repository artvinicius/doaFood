# DoaFood — Backend v2.0.0

API REST em **Node.js + Express** para o app DoaFood.  
O banco de dados é um arquivo JSON local (`data/doafood.json`) gerado automaticamente na primeira execução.

---

## Como rodar

```bash
npm install
cp .env.example .env      # Windows CMD: copy .env.example .env
npm run dev
```

API disponível em `http://localhost:3000`

---

## Credenciais padrão (seed automático)

| Perfil        | E-mail                   | Senha    |
|---------------|--------------------------|----------|
| Administrador | admin@doafood.com        | admin123 |
| Usuário demo  | usuarioteste@doafood.com | teste123 |

---

## Endpoints

### Auth (público)

| Método | Rota           | Body                                      | Resposta          |
|--------|----------------|-------------------------------------------|-------------------|
| POST   | /auth/login    | `{ email, senha }`                        | `{ token, user }` |
| POST   | /auth/cadastro | `{ nome, email, senha, tipoConta, ... }` | `{ id }`          |

### Usuários (requer token Bearer)

| Método | Rota              | Acesso | Descrição                                           |
|--------|-------------------|--------|-----------------------------------------------------|
| GET    | /api/usuarios     | Admin  | Lista todos                                         |
| POST   | /api/usuarios     | Admin  | Cria usuário                                        |
| PUT    | /api/usuarios/:id | Logado | Atualiza dados (aceita `senhaAtual` + `novaSenha`)  |
| DELETE | /api/usuarios/:id | Admin  | Remove usuário                                      |

### Catálogo (público)

| Método | Rota             | Query params       |
|--------|------------------|--------------------|
| GET    | /api/doadores    | `?busca=&cidade=`  |
| GET    | /api/receptores  | `?busca=&cidade=`  |
| GET    | /api/ongs        | `?busca=`          |

### Pontos de Coleta

| Método | Rota                   | Acesso       | Descrição                              |
|--------|------------------------|--------------|----------------------------------------|
| GET    | /api/pontos-coleta     | Público      | Lista pontos (`?lat=&lng=&raio=`)      |
| POST   | /api/pontos-coleta     | ONG / Admin  | Cadastra novo ponto (salva `ongId`)    |
| PUT    | /api/pontos-coleta/:id | Admin        | Atualiza dados do ponto                |
| DELETE | /api/pontos-coleta/:id | Admin        | Remove ponto de coleta                 |

---

## Autenticação

Rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token é retornado pelo `/auth/login` e expira em 7 dias.

- **`auth`** — verifica se o token é válido
- **`adminOnly`** — verifica se `req.user.isAdmin === true`
- Rotas de criação de ponto de coleta verificam `tipoConta === 'ong'` ou `isAdmin` no controller

---

## Estrutura

```
doafood-backend/
├── server.js
├── .env.example
├── src/
│   ├── app.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── catalogoController.js
│   │   └── pontosColetaController.js
│   ├── models/
│   │   ├── usuarioModel.js
│   │   └── pontoColetaModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── catalogoRoutes.js
│   │   └── pontosColetaRoutes.js
│   ├── middleware/
│   │   ├── auth.js         # Verifica JWT Bearer
│   │   └── adminOnly.js    # Bloqueia se não for admin
│   └── database/
│       ├── db.js           # Leitura/escrita do arquivo JSON
│       └── seed.js         # Dados iniciais (admin + usuário demo + 3 pontos)
└── data/
    └── doafood.json        # Banco de dados (gerado automaticamente, não versionado)
```

---

## Resetar o banco

Apague o arquivo `data/doafood.json` e reinicie o servidor — o seed recria tudo automaticamente.
