const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { read, write } = require('./db');

module.exports = function seed() {
  const db = read();
  if (db.usuarios.some((u) => u.email === 'admin@doafood.com')) return;

  const ano = String(new Date().getFullYear());

  db.usuarios.push(
    {
      id: uuidv4(), nome: 'Administrador', email: 'admin@doafood.com',
      senha: bcrypt.hashSync('admin123', 10), tipoConta: 'doador',
      cpf: '', cnpj: '', telefone: '', cidade: '', descricao: '',
      membroDesde: ano, totalDoacoes: 0, isAdmin: true,
    },
    {
      id: uuidv4(), nome: 'Usuário Teste', email: 'usuarioteste@doafood.com',
      senha: bcrypt.hashSync('teste123', 10), tipoConta: 'doador',
      cpf: '', cnpj: '', telefone: '', cidade: '', descricao: '',
      membroDesde: ano, totalDoacoes: 0, isAdmin: false,
    }
  );

  db.pontos_coleta.push(
    { id: uuidv4(), nome: 'Central de Doações SP', endereco: 'Av. Paulista, 1000',   cidade: 'São Paulo',      estado: 'SP', lat: -23.5613, lng: -46.6565, telefone: '(11) 3333-0001', horario: 'Seg–Sex 08h–18h' },
    { id: uuidv4(), nome: 'Banco de Alimentos RJ', endereco: 'Rua da Glória, 290',   cidade: 'Rio de Janeiro', estado: 'RJ', lat: -22.9114, lng: -43.1756, telefone: '(21) 3333-0002', horario: 'Seg–Sáb 09h–17h' },
    { id: uuidv4(), nome: 'Ponto Coleta BH',       endereco: 'Av. Afonso Pena, 500', cidade: 'Belo Horizonte', estado: 'MG', lat: -19.9281, lng: -43.9345, telefone: '(31) 3333-0003', horario: 'Ter–Sáb 10h–16h' }
  );

  write(db);
};
