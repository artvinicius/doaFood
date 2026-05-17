const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  const user = usuarioModel.findByEmail(email.toLowerCase());
  if (!user || !bcrypt.compareSync(senha, user.senha)) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  const { senha: _, ...userPublico } = user;
  userPublico.isAdmin = Boolean(userPublico.isAdmin);

  const token = jwt.sign(
    { id: user.id, isAdmin: Boolean(user.isAdmin) },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: userPublico });
}

function cadastro(req, res) {
  const { nome, email, senha, tipoConta } = req.body;
  if (!nome || !email || !senha || !tipoConta) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, tipoConta.' });
  }

  try {
    const user = usuarioModel.create(req.body);
    res.status(201).json({ id: user.id });
  } catch (err) {
    res.status(409).json({ erro: err.message });
  }
}

module.exports = { login, cadastro };
