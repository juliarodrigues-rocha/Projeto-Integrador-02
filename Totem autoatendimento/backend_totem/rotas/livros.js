const express = require('express');
const router = express.Router();

let retiradas = [];
let devolucoes = [];

// POST /api/livros/retirada
router.post('/retirada', (req, res) => {
  const { ra, codigoLivro } = req.body;

  if (!ra || !codigoLivro) {
    return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
  }

  const novaRetirada = { ra, codigoLivro, data: new Date().toLocaleString() };
  retiradas.push(novaRetirada);

  res.status(201).json({ sucesso: true, mensagem: 'Retirada concluída com sucesso!', dados: novaRetirada });
});

// POST /api/livros/devolucao
router.post('/devolucao', (req, res) => {
  const { ra, codigoLivro } = req.body;

  if (!ra || !codigoLivro) {
    return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
  }

  const novaDevolucao = { ra, codigoLivro, data: new Date().toLocaleString() };
  devolucoes.push(novaDevolucao);

  res.status(201).json({ sucesso: true, mensagem: 'Devolução concluída com sucesso!', dados: novaDevolucao });
});

// (opcional) Rotas para listar tudo
router.get('/retiradas', (req, res) => res.json(retiradas));
router.get('/devolucoes', (req, res) => res.json(devolucoes));

module.exports = router;
