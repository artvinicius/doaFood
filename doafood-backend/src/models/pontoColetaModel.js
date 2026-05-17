const { v4: uuidv4 } = require('uuid');
const { read, write } = require('../database/db');

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function list({ lat, lng, raio } = {}) {
  const pontos = read().pontos_coleta;
  if (!lat || !lng || !raio) return pontos;
  return pontos.filter((p) => {
    if (!p.lat || !p.lng) return true;
    return distanciaKm(lat, lng, p.lat, p.lng) <= raio;
  });
}

function findById(id) {
  return read().pontos_coleta.find((p) => p.id === id) || null;
}

function create(data) {
  const novo = {
    id: uuidv4(),
    nome: data.nome,
    endereco: data.endereco || '',
    cidade: data.cidade || '',
    estado: data.estado || '',
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    telefone: data.telefone || '',
    horario: data.horario || '',
    ongId: data.ongId || null,
  };
  const db = read();
  db.pontos_coleta.push(novo);
  write(db);
  return novo;
}

function update(id, fields) {
  const db = read();
  const idx = db.pontos_coleta.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const allowed = ['nome', 'endereco', 'cidade', 'estado', 'lat', 'lng', 'telefone', 'horario'];
  for (const key of allowed) {
    if (fields[key] !== undefined) db.pontos_coleta[idx][key] = fields[key];
  }
  write(db);
  return db.pontos_coleta[idx];
}

function remove(id) {
  const db = read();
  db.pontos_coleta = db.pontos_coleta.filter((p) => p.id !== id);
  write(db);
}

module.exports = { list, findById, create, update, remove };
