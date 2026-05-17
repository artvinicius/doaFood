const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.post('/login', authController.login);
router.post('/cadastro', authController.cadastro);

module.exports = router;
