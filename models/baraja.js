const fs = require('fs');
const path = require('path');
const { Naipe, Palo } = require('./Naipe');

class Baraja {
  constructor(numCartas) {
    this.numCartas = numCartas;
    this.cartasDir = path.join(__dirname, '../public/images');
    this.cartas = [];
    this.originalState = [];
  }

  async cargarCartas() {
    const files = await fs.promises.readdir(this.cartasDir);
    this.cartas = files
      .filter(file => file.endsWith('.png'))
      .map(file => {
        let parts = file.split('.')[0];
        let numero = parseInt(parts.slice(0, -1), 10);
        let paloCode = parts.slice(-1);
        let palos = { 'O': Palo.OROS, 'C': Palo.COPAS, 'E': Palo.ESPADAS, 'B': Palo.BASTOS };
        return new Naipe(numero, palos[paloCode], `/images/${file}`);
      });

    this.cartas = this.cartas.slice(0, this.numCartas);
    this.originalState = [...this.cartas];
  }

  barajar() {
    for (let i = this.cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
    }
  }

  ordenarCartas() {
    const palosOrden = [Palo.OROS, Palo.COPAS, Palo.ESPADAS, Palo.BASTOS];
    this.cartas.sort((a, b) => {
      let comparison = palosOrden.indexOf(a.palo) - palosOrden.indexOf(b.palo);
      if (comparison === 0) {
        return a.valor - b.valor;
      }
      return comparison;
    });
  }

  ordenarPorValor() {
    this.cartas.sort((a, b) => a.valor - b.valor);
  }

  extraer() {
    const randomIndex = Math.floor(Math.random() * this.cartas.length);
    const cartaExtraida = this.cartas.splice(randomIndex, 1)[0];
    return cartaExtraida;
  }

  devolverCarta(carta) {
    this.cartas.unshift(carta);
  }

  reset() {
    this.cartas = [...this.originalState];
    this.ordenarCartas();
  }
}

module.exports = Baraja;