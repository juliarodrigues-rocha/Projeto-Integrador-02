import express from 'express';
import { cadastrarAluno, VisualizarPontuacao } from '../controllers/alunoController.js';

const router = express.Router();

router.post('/', cadastrarAluno);
router.get('/pontuacao/:ra', VisualizarPontuacao);

export default router;
