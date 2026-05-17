const { Router } = require('express');
const pontosColetaController = require('../controllers/pontosColetaController');
const auth      = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = Router();

router.get('/',     pontosColetaController.listar);
router.post('/',    auth, pontosColetaController.criar);
router.put('/:id',  auth, adminOnly, pontosColetaController.atualizar);
router.delete('/:id', auth, adminOnly, pontosColetaController.excluir);

module.exports = router;
