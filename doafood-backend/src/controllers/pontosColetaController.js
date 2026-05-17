const pontoColetaModel = require('../models/pontoColetaModel');

function listar(req, res) {
  const { lat, lng, raio } = req.query;
  const pontos = pontoColetaModel.list({
    lat: lat ? parseFloat(lat) : null,
    lng: lng ? parseFloat(lng) : null,
    raio: raio ? parseFloat(raio) : null,
  });
  res.json(pontos);
}

function criar(req, res) {
  const user = req.user;
  if (user.tipoConta !== 'ong' && !user.isAdmin) {
    return res.status(403).json({ erro: 'Apenas ONGs podem cadastrar pontos de coleta.' });
  }
  try {
    const ponto = pontoColetaModel.create({ ...req.body, ongId: user.id });
    res.status(201).json(ponto);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

function atualizar(req, res) {
  const ponto = pontoColetaModel.update(req.params.id, req.body);
  if (!ponto) return res.status(404).json({ erro: 'Ponto não encontrado.' });
  res.json(ponto);
}

function excluir(req, res) {
  if (!pontoColetaModel.findById(req.params.id)) {
    return res.status(404).json({ erro: 'Ponto não encontrado.' });
  }
  pontoColetaModel.remove(req.params.id);
  res.status(204).send();
}

module.exports = { listar, criar, atualizar, excluir };
