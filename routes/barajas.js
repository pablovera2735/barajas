const express = require('express');
const router = express.Router();
const Baraja = require('../models/Baraja');

const baraja = new Baraja(40);
let cartasExtraidas = [];
let carta = null;

router.get('/', async (req, res) => {
  try {
    if (!baraja.cartas || baraja.cartas.length === 0) {
      await baraja.cargarCartas();
      baraja.ordenarCartas();
    }
    res.render('barajas', { title: 'Baraja de Naipes Españoles', cartas: baraja.cartas, criterio: "palo-valor", extraida: carta });
  } catch (error) {
    console.error('Error al cargar las cartas:', error);
    res.status(500).send('Error al mostrar las cartas.');
  }
});

router.post('/barajar', async (req, res) => {
  try {
    baraja.barajar();
    carta = null;
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al barajar las cartas:', error);
    res.status(500).send('Error al barajar las cartas.');
  }
});

router.post('/ordenar', async (req, res) => {
  const criterio = req.body.criterio || 'palo-valor';
  try {
    if (criterio === 'valor') {
      baraja.ordenarPorValor();
    } else {
      baraja.ordenarCartas();
    }
    carta = null;
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al ordenar las cartas:', error);
    res.status(500).send('Error al ordenar las cartas.');
  }
});

router.post('/extraer', async (req, res) => {
  try {
    carta = baraja.extraer();
    if (carta) {
      cartasExtraidas.push(carta);
      res.redirect('/barajas');
    } else {
      res.status(404).send('No hay más cartas para extraer.');
    }
  } catch (error) {
    console.error('Error al extraer la carta:', error);
    res.status(500).send('Error al extraer la carta.');
  }
});

router.post('/devolver', async (req, res) => {
  if (cartasExtraidas.length > 0) {
    const cartaDevuelta = cartasExtraidas.pop();
    baraja.devolverCarta(cartaDevuelta);
    carta = null;
    res.redirect('/barajas');
  } else {
    res.status(404).send('No hay cartas para devolver.');
  }
});

router.post('/reset', async (req, res) => {
  try {
    baraja.reset();
    carta = null;
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al reiniciar la baraja:', error);
    res.status(500).send('Error al reiniciar la baraja.');
  }
});

router.post('/salir', (req, res) => {
  res.redirect('/login');
});

module.exports = router;