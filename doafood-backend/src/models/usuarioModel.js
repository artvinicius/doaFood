const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { read, write } = require('../database/db');

function toPublic({ senha, ...rest }) {
  return rest;
}

function findByEmail(email) {
  return read().usuarios.find((u) => u.email === email);
}

function findById(id) {
  const u = read().usuarios.find((u) => u.id === id);
  return u ? toPublic(u) : null;
}

function findByIdFull(id) {
  return read().usuarios.find((u) => u.id === id) || null;
}

function list() {
  return read().usuarios.map(toPublic);
}

function listByTipo(tipoConta, busca, cidade) {
  return read()
    .usuarios.filter((u) => {
      if (u.tipoConta !== tipoConta) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!u.nome.toLowerCase().includes(q) && !u.cidade.toLowerCase().includes(q)) return false;
      }
      if (cidade && !u.cidade.toLowerCase().includes(cidade.toLowerCase())) return false;
      return true;
    })
    .map(toPublic);
}

function create(data) {
  if (findByEmail(data.email.toLowerCase())) throw new Error('E-mail já cadastrado.');

  const novo = {
    id: uuidv4(),
    nome: data.nome,
    email: data.email.toLowerCase(),
    senha: bcrypt.hashSync(data.senha, 10),
    tipoConta: data.tipoConta,
    cpf: data.cpf || '',
    cnpj: data.cnpj || '',
    telefone: data.telefone || '',
    cidade: data.cidade || '',
    descricao: data.descricao || '',
    membroDesde: String(new Date().getFullYear()),
    totalDoacoes: 0,
    isAdmin: Boolean(data.isAdmin),
  };

  const db = read();
  db.usuarios.push(novo);
  write(db);

  return toPublic(novo);
}

function update(id, fields) {
  const db = read();
  const idx = db.usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  const allowed = ['nome', 'email', 'telefone', 'cidade', 'descricao', 'totalDoacoes'];
  for (const key of allowed) {
    if (fields[key] !== undefined) db.usuarios[idx][key] = fields[key];
  }
  if (fields.senha) {
    db.usuarios[idx].senha = bcrypt.hashSync(fields.senha, 10);
  }

  write(db);
  return toPublic(db.usuarios[idx]);
}

function remove(id) {
  const db = read();
  db.usuarios = db.usuarios.filter((u) => u.id !== id);
  write(db);
}

module.exports = { findByEmail, findById, findByIdFull, list, listByTipo, create, update, remove };
