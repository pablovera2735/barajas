const express = require('express');
const router = express.Router();
const Baraja = require('../models/baraja');

const baraja = new Baraja();


router.get('/', async (req, res) => {
    try {
        const cartas = await baraja.cargarCartas();
        res.render('barajas', { title: 'Baraja Española', cartas: cartas });
    } catch (error) {
        console.error('Failed to load cards:', error);
        res.status(500).send('Failed to load cards.');
    }
});


router.get('/barajar', (req, res) => {
    const cartas = baraja.barajar();
    res.json(cartas);
});


router.get('/extraer', (req, res) => {
    const carta = baraja.extraer();
    if (carta) {
        res.json(carta);
    } else {
        res.status(404).send('No more cards to draw.');
    }
});



router.get('/reset', (req, res) => {
    const cartas = baraja.reset();
    res.json(cartas);
});


router.get('/salir', (req, res) => {
    baraja.reset();
    res.redirect('/');
});

module.exports = router;
