const express = require('express');
const router = express.Router();
const Baraja = require('../models/baraja');

const baraja = new Baraja(20);
let cartasExtraidas = [];
let carta = null;

router.get('/', async (req, res) => {
  try {
    if (!baraja.cartas || baraja.cartas.length === 0) {
      await baraja.cargarCartas();
      baraja.ordenarCartas();
    }
    res.render('barajas', { title: 'Baraja de Naipes Españoles', cartas: baraja.cartas, criterio: "palo-valor", extraida: carta, cartasExtraidas: cartasExtraidas });
  } catch (error) {
    console.error('Error al cargar las cartas:', error);
    res.status(500).send('Error al mostrar las cartas.');
  }
});

router.post('/barajar', async (req, res) => {
  try {
    baraja.barajar();
    carta = null;
    cartasExtraidas = [];
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
    cartasExtraidas = [];
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
      if (baraja.cartas.length === 0) {
        baraja.reset();
        carta = null;
        cartasExtraidas = [];
      } else {
        if (cartasExtraidas.length > 2) {
          cartasExtraidas.shift();
        }
      }
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
  try {
    if (cartasExtraidas.length > 0) {
      const cartaDevuelta = cartasExtraidas.pop();
      baraja.devolverCarta(cartaDevuelta);
      carta = cartasExtraidas[cartasExtraidas.length - 1] || null;

      if (cartasExtraidas.length === 0) {
        baraja.cargarCartas();
      }
      res.redirect('/barajas');
    } else {
      baraja.reset();
      res.redirect('/barajas');
    }
  } catch (error) {
    console.error('Error al devolver la carta:', error);
    res.status(500).send('Error al devolver la carta.');
  }
});

router.post('/reset', async (req, res) => {
  try {
    baraja.reset();
    carta = null;
    cartasExtraidas = [];
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