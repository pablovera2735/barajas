const express = require('express');
const router = express.Router();
const Baraja = require('../models/baraja');

const baraja = new Baraja(20);
let cartasExtraidas = [];
let carta = null;
let contadorExtraidas = 0;
let contadorDevueltas = 0;

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    if (!baraja.cartas || baraja.cartas.length === 0) {
      await baraja.cargarCartas();
      baraja.ordenarCartas();
    }
    res.render('barajas', {
      title: 'Baraja de Naipes Españoles',
      cartas: baraja.cartas,
      criterio: "palo-valor",
      extraida: carta,
      cartasExtraidas: cartasExtraidas,
      totalCartas: baraja.cartas.length,
      contadorExtraidas,
      contadorDevueltas
    });
  } catch (error) {
    console.error('Error al cargar las cartas:', error);
    res.status(500).send('Error al mostrar las cartas.');
  }
});

router.post('/barajar', ensureAuthenticated, async (req, res) => {
  try {
    baraja.barajar();
    carta = null;
    cartasExtraidas = [];
    contadorExtraidas = 0;
    contadorDevueltas = 0;
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al barajar las cartas:', error);
    res.status(500).send('Error al barajar las cartas.');
  }
});

router.post('/ordenar', ensureAuthenticated, async (req, res) => {
  const criterio = req.body.criterio || 'palo-valor';
  try {
    if (criterio === 'valor') {
      baraja.ordenarPorValor();
    } else {
      baraja.ordenarCartas();
    }
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al ordenar las cartas:', error);
    res.status(500).send('Error al ordenar las cartas.');
  }
});

router.post('/extraer', ensureAuthenticated, async (req, res) => {
  try {
    carta = baraja.extraer();
    if (carta) {
      cartasExtraidas.push({ carta, visible: true });
      contadorExtraidas++;
      if (baraja.cartas.length === 0) {
        baraja.reset();
        carta = null;
        cartasExtraidas = [];
        contadorExtraidas = 0;
        contadorDevueltas = 0;
      } else {
        if (cartasExtraidas.length > 2) {
          cartasExtraidas[cartasExtraidas.length - 3].visible = false;
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

router.post('/devolver', ensureAuthenticated, async (req, res) => {
  try {
    if (cartasExtraidas.length > 0) {
      const cartaDevuelta = cartasExtraidas.pop().carta;
      baraja.devolverCarta(cartaDevuelta);
      contadorDevueltas++;
      carta = cartasExtraidas[cartasExtraidas.length - 1]?.carta || null;

      if (cartasExtraidas.length >= 2) {
        cartasExtraidas[cartasExtraidas.length - 2].visible = true;
      }

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

router.post('/reset', ensureAuthenticated, async (req, res) => {
  try {
    baraja.reset();
    carta = null;
    cartasExtraidas = [];
    contadorExtraidas = 0;
    contadorDevueltas = 0;
    res.redirect('/barajas');
  } catch (error) {
    console.error('Error al reiniciar la baraja:', error);
    res.status(500).send('Error al reiniciar la baraja.');
  }
});

router.post('/salir', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión.');
    }
    res.redirect('/login');
  });
});

module.exports = router;