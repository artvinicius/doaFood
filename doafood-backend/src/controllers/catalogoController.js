const usuarioModel = require('../models/usuarioModel');

function doadores(req, res) {
  const { busca, cidade } = req.query;
  res.json(usuarioModel.listByTipo('doador', busca, cidade));
}

function receptores(req, res) {
  const { busca, cidade } = req.query;
  res.json(usuarioModel.listByTipo('receptor', busca, cidade));
}

function ongs(req, res) {
  const { busca } = req.query;
  res.json(usuarioModel.listByTipo('ong', busca, null));
}

module.exports = { doadores, receptores, ongs };
