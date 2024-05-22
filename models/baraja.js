const fs = require('fs');
const path = require('path');

class Baraja {
    constructor() {
        this.cartasDir = path.join(__dirname, '../public/images');
        this.cartas = [];
        this.originalState = [];
    }

    async cargarCartas() {
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
                    })
                    .sort((a, b) => {
                        if (a.paloCode === b.paloCode) {
                            return a.numero - b.numero;
                        }
                        return a.paloCode.localeCompare(b.paloCode);
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
        return this.cartas;
    }

    extraer() {
        return this.cartas.shift();
    }

    reset() {
        this.cartas = [...this.originalState];
        return this.cartas;
    }

    salir() {
        this.reset();
    }
}

module.exports = Baraja;