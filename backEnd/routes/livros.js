import express from 'express';
import { cadastrarLivro, getLivros } from '../controllers/livroController.js';

const router = express.Router();

router.post('/', cadastrarLivro);
router.get('/', getLivros);

export default router;


