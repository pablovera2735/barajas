const fs = require('fs');
const path = require('path');

class Baraja {
    constructor() {
        this.cartasDir = path.join(__dirname, '../public/images');
        this.cartas = [];
        this.originalState = [];
    }

     cargarCartas() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.cartasDir, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.cartas = files
                    .filter(file => file.endsWith('.png'))
                    .map(file => {
                        let parts = file.split('.')[0];
                        let numero = parseInt(parts.slice(0, -1), 10);
                        let paloCode = parts.slice(-1);
                        let palos = { 'O': 'oros', 'C': 'copas', 'E': 'espadas', 'B': 'bastos' };
                        return {
                            url: `/images/${file}`,
                            palo: palos[paloCode],
                            numero: numero,
                            paloCode: paloCode
                        };
                    });
                this.originalState = [...this.cartas];
                resolve(this.cartas);
            });
        });
    }

    barajar() {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }

    ordenarCartas() {
        const palosOrden = ['oros', 'copas', 'espadas', 'bastos'];
        this.cartas.sort((a, b) => {
            let comparison = palosOrden.indexOf(a.palo) - palosOrden.indexOf(b.palo);
            if (comparison === 0) {
                return a.numero - b.numero;
            }
            return comparison;
        });
    }

    ordenarPorValor() {
        this.cartas.sort((a, b) => a.numero - b.numero);
    }

    extraer() {
        return this.cartas.shift();
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