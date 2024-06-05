class Naipe {
    constructor(valor, palo, rutaImagen) {
      this.valor = valor;
      this.palo = palo;
      this.rutaImagen = rutaImagen;
    }
  }
  
  const Palo = Object.freeze({
    OROS: 'oros',
    COPAS: 'copas',
    ESPADAS: 'espadas',
    BASTOS: 'bastos'
  });
  
  module.exports = { Naipe, Palo };