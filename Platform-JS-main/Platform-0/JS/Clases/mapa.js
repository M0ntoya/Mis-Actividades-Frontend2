// ─────────────────────────────────────────────────────────────────────────────
// Mapa.js
// Clase responsable de representar y gestionar el escenario de fondo.
// Contiene referencias a la textura, dimensiones lógicas del juego y al
// jugador (para saber cuándo desplazar el fondo).
// ─────────────────────────────────────────────────────────────────────────────
export default class Mapa {
    /**
     * @param {number} anchoJuego  Anchura lógica del canvas
     * @param {number} altoJuego   Altura lógica del canvas
     * @param {Jugador} jugador    Instancia del jugador (para consultas)
     */
    constructor(anchoJuego, altoJuego, jugador) {
        // Dimensiones visibles de la “ventana” de juego.
        this.anchoJuego = anchoJuego;
        this.altoJuego  = altoJuego;

        // Referencia al jugador para calcular el desplazamiento relativo.
        this.jugador = jugador;

        // Imagen del mapa precargada en el HTML (<img id="mapa1">)
        this.fondo = document.getElementById("mapa1");

        // Desplazamiento actual del mapa (origen del drawImage).
        this.x = 0;  // Offset horizontal
        this.y = 0;  // Offset vertical (no se usa en este ejemplo)
    }

    /**
     * update()
     * ---------------------------------------------------------------------
     * Método que el loop de juego llamará cada fotograma.
     * Aquí deben implementar la lógica de scroll infinito del mapa.
     */
    update() {
        // ← Implementar lógica de desplazamiento aquí →
    }
    
    /**
     * draw(ctx)
     * ---------------------------------------------------------------------
     * Dibuja el fondo en las coordenadas actuales.
     * @param {CanvasRenderingContext2D} ctx Contexto de render 2D del canvas
     */
    draw(ctx) {
        ctx.drawImage(
            this.fondo,          // Fuente
            this.x, this.y,      // Posición de la imagen en la pantalla
            this.anchoJuego,     // Escala al ancho de la ventana de juego
            this.altoJuego       // Escala a la altura de la ventana de juego
        );
    }
}
