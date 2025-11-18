import express from "express";
import { registrarEmprestimo, registrarDevolucao } from "../controllers/emprestimoController.js";

const router = express.Router();

// Rotas para retirada e devolução
router.post("/retirada", registrarEmprestimo);
router.post("/devolucao", registrarDevolucao);

export default router;
