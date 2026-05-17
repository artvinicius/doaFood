const { Router } = require('express');
const catalogoController = require('../controllers/catalogoController');

const router = Router();

router.get('/doadores',   catalogoController.doadores);
router.get('/receptores', catalogoController.receptores);
router.get('/ongs',       catalogoController.ongs);

module.exports = router;
