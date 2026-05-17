# DoaFood — v2.0.0

Aplicativo mobile de doação de alimentos desenvolvido com **React Native + Expo SDK 54**.  
Conecta doadores, receptores e ONGs com catálogo, autenticação JWT e backend Node.js + Express.

---

## Pré-requisitos

- Node.js 20 LTS e npm
- Dois terminais abertos (um para o backend, um para o frontend)

---

## 1. Rodando o Backend

```bash
cd doafood-backend
npm install
cp .env.example .env      # Windows CMD: copy .env.example .env
npm run dev
```

API disponível em `http://localhost:3000`

O banco de dados (`data/doafood.json`) é criado automaticamente com dados iniciais na primeira execução.

> **Celular físico:** edite `DoaFood/src/config.js` e troque `localhost` pelo IP local da sua máquina (ex: `192.168.1.10`).

---

## 2. Rodando o Frontend

Com o backend já rodando, abra um segundo terminal:

```bash
cd DoaFood
npm install --legacy-peer-deps

# Web (navegador)
npx expo start --web --clear

# Celular (instale Expo Go no iOS/Android e escaneie o QR)
npx expo start
```

**Porta padrão:** `http://localhost:8081`

---

## Credenciais de acesso (demo)

| Perfil        | E-mail                       | Senha     |
|---------------|------------------------------|-----------|
| Administrador | admin@doafood.com            | admin123  |
| Usuário demo  | usuarioteste@doafood.com     | teste123  |

---

## Funcionalidades por tipo de conta

### Doador / Receptor
- Cadastro e login com JWT
- Editar perfil (nome, telefone, cidade)
- Troca de senha com verificação
- Ver catálogo de doadores, receptores e ONGs
- Ver pontos de coleta no mapa

### ONG
- Tudo que Doador/Receptor tem
- Seção **"Minha ONG"** no perfil → cadastrar ponto de coleta próprio
- Botão **"+"** na tela de Pontos de Coleta para adicionar novo ponto
- Ponto fica vinculado à ONG e visível para todos

### Administrador
- **Painel Administrativo** com duas abas:
  - **Usuários** — lista todos (Doador, Receptor, ONG), exclui individualmente, cria novo usuário
  - **Pontos de Coleta** — lista todos os pontos (mostra se foi criado por ONG ou seed do sistema), exclui qualquer ponto

---

## Estrutura de arquivos

```
ProjetoAlvaro/
├── DoaFood/                        # Frontend React Native + Expo
│   ├── App.js
│   ├── app.json                    # Versão do app
│   ├── src/
│   │   ├── config.js               # URL da API (trocar para IP local no celular)
│   │   ├── navigation/
│   │   │   └── AppNavigator.js     # Todas as rotas (Stack Navigator)
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── CadastroScreen.js
│   │   │   ├── CatalogoScreen.js
│   │   │   ├── DetalheScreen.js
│   │   │   ├── PerfilScreen.js
│   │   │   ├── EditarPerfilScreen.js
│   │   │   ├── PontosColetaScreen.js
│   │   │   ├── OngCadastrarPontoScreen.js   # Novo em v2.0.0
│   │   │   ├── AdminDashboardScreen.js      # Novo em v2.0.0
│   │   │   ├── AdminUsuariosScreen.js
│   │   │   ├── AdminCriarUsuarioScreen.js
│   │   │   └── TermosScreen.js
│   │   ├── services/
│   │   │   ├── api.js              # Cliente HTTP — todas as chamadas ao backend
│   │   │   └── db.js               # Gerenciamento de sessão via AsyncStorage
│   │   └── theme/
│   │       └── index.js            # Cores, raios e sombras centralizados
│   └── assets/                     # Ícones e splash screen
│
└── doafood-backend/                # Backend Node.js + Express
    ├── server.js
    ├── .env.example
    ├── src/
    │   ├── app.js
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   │   ├── auth.js             # Verifica JWT Bearer
    │   │   └── adminOnly.js        # Bloqueia se não for admin
    │   └── database/
    │       ├── db.js               # Leitura/escrita do JSON
    │       └── seed.js             # Dados iniciais
    └── data/
        └── doafood.json            # Banco de dados (gerado automaticamente, não versionado)
```

---

## API — Endpoints

### Auth (público)

| Método | Rota           | Body                                      | Resposta          |
|--------|----------------|-------------------------------------------|-------------------|
| POST   | /auth/login    | `{ email, senha }`                        | `{ token, user }` |
| POST   | /auth/cadastro | `{ nome, email, senha, tipoConta, ... }` | `{ id }`          |

### Usuários (requer token Bearer)

| Método | Rota              | Acesso | Descrição                                  |
|--------|-------------------|--------|--------------------------------------------|
| GET    | /api/usuarios     | Admin  | Lista todos os usuários                    |
| POST   | /api/usuarios     | Admin  | Cria usuário direto no banco               |
| PUT    | /api/usuarios/:id | Logado | Atualiza dados (aceita `senhaAtual` + `novaSenha`) |
| DELETE | /api/usuarios/:id | Admin  | Remove usuário                             |

### Catálogo (público)

| Método | Rota             | Query params       |
|--------|------------------|--------------------|
| GET    | /api/doadores    | `?busca=&cidade=`  |
| GET    | /api/receptores  | `?busca=&cidade=`  |
| GET    | /api/ongs        | `?busca=`          |

### Pontos de Coleta

| Método | Rota                | Acesso | Descrição                               |
|--------|---------------------|--------|-----------------------------------------|
| GET    | /api/pontos-coleta  | Público | Lista pontos (filtro `?lat=&lng=&raio=`) |
| POST   | /api/pontos-coleta  | ONG / Admin | Cadastra novo ponto de coleta       |
| PUT    | /api/pontos-coleta/:id | Admin | Atualiza dados do ponto              |
| DELETE | /api/pontos-coleta/:id | Admin | Remove ponto de coleta               |

### Autenticação

Rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token é retornado pelo `/auth/login` e expira em 7 dias.

---

## Banco de dados

O backend usa um arquivo JSON simples (`data/doafood.json`), sem necessidade de instalação de banco externo.  
O arquivo é criado automaticamente na primeira execução com o seed padrão.

Estrutura do banco:

```json
{
  "usuarios": [ ... ],
  "pontos_coleta": [ ... ]
}
```

Para resetar o banco, basta apagar `data/doafood.json` e reiniciar o backend.

---

*Projeto acadêmico — Desenvolvimento Mobile Android 2025 · v2.0.0*
