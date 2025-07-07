// ─────────────────────────────────────────────────────────────────────────────
// main.js — Punto de entrada del juego
// Describe el ciclo de vida completo: inicializa canvas, crea las entidades
// principales, ejecuta el bucle de juego (update + draw) y mantiene la
// sincronización con el monitor mediante requestAnimationFrame.
// ─────────────────────────────────────────────────────────────────────────────

// 1. Importaciones de módulos ES6
//    • Jugador:  lógica, física y animación del personaje.
//    • InputHandler: mapea eventos de teclado → comandos. Guarda `lastKey`.
//    • Mapa:  fondo/escenario; en la versión del alumnado implementará scroll.
import Jugador       from "./Clases/jugador.js";
import InputHandler  from "./Clases/stateMachine/input.js"; 
import Mapa          from "./Clases/mapa.js";

// 2. Esperar a que todo el DOM, imágenes y scripts estén cargados.
//    Así evitamos acceder a <canvas> o <img> antes de tiempo.
window.onload = function () {

    // ────────────────── Configuración básica del canvas ──────────────────
    const canvas  = document.getElementById("canvas");  // Nodo <canvas>
    const context = canvas.getContext("2d");            // Contexto de render 2D

    // Dimensiones lógicas del juego (la etiqueta <canvas> ya define width/height)
    const gameWidth  = canvas.width;
    const gameHeight = canvas.height;
    console.log("Canvas dimensions:", gameWidth, gameHeight);

    // Reloj para delta-time (tiempo entre frames).  Se reinicia en cada frame.
    // Se usa milisegundos → segundos para que las fórmulas de física sean claras.
    let tiempoInicio = 0;

    // ─────────────── Creación de objetos principales del juego ────────────
    const jugador = new Jugador(gameWidth, gameHeight);      // Personaje
    const input   = new InputHandler();                      // Teclado
    const mapa1   = new Mapa(gameWidth, gameHeight, jugador); // Fondo/scroll

    /**
     * update(dt)
     * ---------------------------------------------------------------------
     * Avanza la simulación del juego.
     * @param {number} dt Δt en segundos desde el último frame (≈ 1/60 s)
     */
    function update(dt) {
        // 1. Actualiza la física y el estado del jugador con la última tecla.
        jugador.update(input.lastKey, dt);

        // 2. Actualiza el mapa.  Por ahora no usa dt; los alumnos lo añadirán
        //    cuando implementen el desplazamiento con velocidad variable.
        mapa1.update(dt);
    }

    /**
     * draw()
     * ---------------------------------------------------------------------
     * Renderiza el fotograma actual.
     * 1. Limpia completamente la superficie.
     * 2. Dibuja el fondo (mapa) y encima el jugador.
     */
    function draw() {
        context.clearRect(0, 0, gameWidth, gameHeight); // Borrar frame anterior
        mapa1.draw(context);                            // Fondo / escenario
        jugador.draw(context);                          // Personaje
    }

    /**
     * gameLoop()
     * ---------------------------------------------------------------------
     * Bucle principal: calcula Δt, actualiza la lógica y dibuja.
     * requestAnimationFrame se encarga de:
     *   • Ajustar la llamada al refresco real del monitor (≈ 60 Hz)
     *   • Ahorrar CPU/GPU cuando la pestaña está en segundo plano
     */
    function gameLoop() {
        // 1. Calcular Δt
        const tiempoActual = Date.now();               // Marca temporal en ms
        const deltaTime = (tiempoActual - tiempoInicio) / 1000; // ms → s
        tiempoInicio = tiempoActual;                   // Preparar siguiente frame

        // 2. Actualizar lógica y render
        update(deltaTime);
        draw();

        // 3. Planificar el siguiente fotograma
        requestAnimationFrame(gameLoop);
    }

    // Lanzar el primer frame; el resto será recursivo.
    requestAnimationFrame(gameLoop);
};
