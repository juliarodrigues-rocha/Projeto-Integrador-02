import express from 'express';
import { cadastrarLivro, getLivros, getLivroPorCodigo } from '../controllers/livroController.js';

const router = express.Router();

router.post('/', cadastrarLivro);
router.get('/', getLivros);
router.get('/:codigo', getLivroPorCodigo);

export default router;


