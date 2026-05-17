const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');

function listar(req, res) {
  res.json(usuarioModel.list());
}

function criar(req, res) {
  try {
    const user = usuarioModel.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ erro: err.message });
  }
}

function atualizar(req, res) {
  const { senhaAtual, novaSenha, ...fields } = req.body;

  if (!usuarioModel.findById(req.params.id)) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  if (novaSenha) {
    if (!senhaAtual) return res.status(400).json({ erro: 'Informe a senha atual.' });
    const full = usuarioModel.findByIdFull(req.params.id);
    if (!bcrypt.compareSync(senhaAtual, full.senha)) {
      return res.status(400).json({ erro: 'Senha atual incorreta.' });
    }
    fields.senha = novaSenha;
  }

  res.json(usuarioModel.update(req.params.id, fields));
}

function excluir(req, res) {
  if (!usuarioModel.findById(req.params.id)) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  usuarioModel.remove(req.params.id);
  res.status(204).send();
}

module.exports = { listar, criar, atualizar, excluir };
