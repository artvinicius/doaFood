require('dotenv').config();
const app = require('./src/app');
const seed = require('./src/database/seed');

seed();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DoaFood API rodando em http://localhost:${PORT}`));
