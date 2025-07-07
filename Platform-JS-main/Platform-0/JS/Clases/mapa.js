// ─────────────────────────────────────────────────────────────────────────────
// Mapa.js
// Clase responsable de representar y gestionar el escenario de fondo.
// Realiza desplazamiento infinito lateral automático de la imagen de fondo.
// 
export default class Mapa {
    /**
     * @param {number} anchoJuego  Anchura lógica del canvas
     * @param {number} altoJuego   Altura lógica del canvas
     * @param {Jugador} jugador    Instancia del jugador (no usada en scroll automático)
     */
    constructor(anchoJuego, altoJuego, jugador) {
        this.anchoJuego = anchoJuego;
        this.altoJuego = altoJuego;
        this.jugador = jugador;

        this.fondo = document.getElementById("mapa1");

        // Offset horizontal del fondo
        this.x = 0;

        // Velocidad del scroll
        this.velocidadScroll = 2;
    }

    /**
     * update()
     * Mueve el fondo automáticamente hacia la izquierda de forma infinita.
     */
    update(dt) {
        const fondoAncho = this.fondo.width;

        // Mover fondo en sentido opuesto a velocidad del jugador
        this.x -= this.jugador.velocidad * dt;

        // Loop infinito: ajustar x para que no se salga del rango
        if (this.x <= -fondoAncho) {
            this.x += fondoAncho;
        } else if (this.x >= 0) {
            this.x -= fondoAncho;
        }
    }

    /**
     * draw(ctx)
     * Dibuja dos copias del fondo para lograr efecto continuo.
     */
    draw(ctx) {
        const fondoAncho = this.fondo.width;

        ctx.drawImage(this.fondo, this.x, 0, fondoAncho, this.altoJuego);
        ctx.drawImage(this.fondo, this.x + fondoAncho, 0, fondoAncho, this.altoJuego);
    }
}
