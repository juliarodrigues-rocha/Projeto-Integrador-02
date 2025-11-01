import express from 'express';
import { cadastrarLivro, getLivros } from '../controllers/bibliotecarioController.js';

const router = express.Router();

router.post('/', cadastrarLivro);
router.get('/', getLivros);

export default router;
