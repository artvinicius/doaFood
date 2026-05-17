const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = Router();

router.use(auth);

router.get('/',     adminOnly, usuarioController.listar);
router.post('/',    adminOnly, usuarioController.criar);
router.put('/:id',             usuarioController.atualizar);
router.delete('/:id', adminOnly, usuarioController.excluir);

module.exports = router;
