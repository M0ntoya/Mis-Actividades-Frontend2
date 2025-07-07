// ─────────────────────────────────────────────────────────────────────────────
// jugador.js
// Clase que encapsula TODA la lógica y el renderizado del personaje
// principal.  Gestiona estados (parado, agachado, caminar, saltar, caer),
// animación por spritesheet, movimiento horizontal, salto y gravedad.
// ─────────────────────────────────────────────────────────────────────────────

// Importamos cada clase-estado que compone la máquina de estados del jugador.
// Cada estado sabe:
//  • enter()       → qué hacer al activarse (p. ej. cambiar spritesheet)
//  • handleInput() → cómo reaccionar a teclado/cursor
//  • exit()        → (opcional) limpieza al abandonar el estado
import {
  ParadoIzq,  ParadoDer,
  AgachadoDer, AgachadoIzq,
  CaminarDer,  CaminarIzq,
  SaltarIzq,   SaltarDer,
  CaerIzq,     CaerDer
} from "./stateMachine/state.js";

export default class Jugador {
  /**
   * @param {number} anchoJuego  Anchura lógica del canvas
   * @param {number} altojuego   Altura lógica del canvas
   */
  constructor(anchoJuego, altojuego) {
    // ───────────── Parámetros de entorno ─────────────
    this.anchoJuego = anchoJuego;  // Límite horizontal del mundo visible
    this.altojuego  = altojuego;   // Límite vertical (= suelo)

    // ───────────── Máquina de estados ────────────────
    // Creamos una instancia de cada estado y las guardamos en un array
    // para poder referirnos a ellas por índice.
    this.estados = [
      new ParadoIzq(this),  new ParadoDer(this),
      new AgachadoIzq(this),new AgachadoDer(this),
      new CaminarIzq(this), new CaminarDer(this),
      new SaltarIzq(this),  new SaltarDer(this),
      new CaerIzq(this),    new CaerDer(this)
    ];
    this.estadoActual = this.estados[1];  // Arrancamos “ParadoDerecha”

    // ───────────── Datos del spritesheet ─────────────
    this.spriteSheet  = document.getElementById("paradoDerecha"); // <img …>
    this.anchoSprite  = 42;   // Anchura de un frame, en px
    this.altoSprite   = 64;   // Altura  de un frame, en px
    this.columna      = 0;    // Frame X actual en la hoja
    this.fila         = 0;    // Frame Y actual en la hoja
    this.maxFrames    = 4;    // Nº total de frames de la animación paradoDerecha
    this.FPS          = 8;    // Velocidad de animación
    this.frameTimer   = 0;    // Acumulador de tiempo para avanzar de frame
    this.ajusteTiempo = 1000 / this.FPS; // Duración (ms) de cada frame'
    this.caerEstilo = false;
    this.direccionCaida = 0;
    

    // ───────────── Propiedades físicas ───────────────
    this.x = 100;                          // Posición X inicial
    this.y = altojuego - this.altoSprite;  // Posición Y inicial (sobre suelo)

    this.velocidad          = 0;    // Velocidad horizontal
    this.maxVelocidad       = 200;  // Límite horizontal px/seg
    this.maxVelocidadSalto  = -300; // Empuje inicial del salto (negativo = arriba)
    this.velocidadSalto     = 0;    // Velocidad vertical
    this.gravedad           = 750;  // Aceleración hacia abajo px/s²
    this.saltando           = false;// Flag de salto (lo usan los estados)
  }

  /**
   * draw(ctx)
   * -------------------------------------------------------------------------
   * Renderiza el frame actual del sprite en la posición (x, y) del canvas.
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    context.drawImage(
      this.spriteSheet,
      this.columna * this.anchoSprite, // Origen X dentro del sheet
      this.fila    * this.altoSprite,  // Origen Y dentro del sheet
      this.anchoSprite,                // Size del recorte
      this.altoSprite,
      this.x,                          // Destino en pantalla
      this.y,
      this.anchoSprite,                // Escalamos 1:1
      this.altoSprite
    );
  }

  /**
   * update(input, dt)
   * -------------------------------------------------------------------------
   * Lógica por fotograma: animación, cambio de estado, movimiento y física.
   * @param {string}  input Última tecla registrada por el InputHandler
   * @param {number}  dt    Δt en segundos desde el frame anterior
   */
  update(input, dt) {
    // ───── 1. Animación del sprite ─────
    if (this.frameTimer > this.ajusteTiempo) {
      // Avanzar al siguiente frame (cíclico)
      this.columna = (this.columna < this.maxFrames - 1) ? this.columna + 1 : 0;
      this.frameTimer = 0;             // Reiniciar temporizador
    } else {
      this.frameTimer += dt * 1000;    // Acumular tiempo en ms
    }

    // ───── 2. Delegar control al estado actual ─────
    // Cada estado decide cómo responder a la entrada y
    // puede modificar velocidad, spriteSheet, etc.
    this.estadoActual.handleInput(input);

    // ───── 3. Movimiento horizontal ─────
    this.x += this.velocidad * dt;         // Desplazar en X usando Δt
    // Clamp a los bordes del canvas
    if (this.x < 0) this.x = 0;
    else if (this.x + this.anchoSprite > this.anchoJuego)
      this.x = this.anchoJuego - this.anchoSprite;

    // ───── 4. Movimiento vertical (salto/gravedad) ─────
    this.y += this.velocidadSalto * dt;    // Aplicar velocidad vertical
    if (!this.enSuelo()) {
      this.velocidadSalto += this.gravedad * dt; // Gravedad
    } else {
      // Reposicionar exacto sobre el “suelo” y resetear salto
      this.y = this.altojuego - this.altoSprite - 32;
      this.velocidadSalto = 0;
    }
    
    if (this.caerEstilo){
      
      this.velocidad += 250 * this.direccionCaida  * dt; // Desaceleración horizontal al caer      
    }

    console.log("Estado actual:", this.estadoActual.constructor.name,
      "caerEstilo:", this.caerEstilo
    );
  }

  /**
   * setState(estado)
   * -------------------------------------------------------------------------
   * Cambia el estado actual de la máquina de estados.
   * @param {number} estado Índice del nuevo estado en this.estados[]
   */
  setState(estado) {
    this.columna = 0;            // Reiniciar frame de animación

    // Llamar al exit() del estado anterior si existe
    if (this.estadoActual.exit) this.estadoActual.exit();

    // Activar nuevo estado + enter()
    this.estadoActual = this.estados[estado];
    this.estadoActual.enter();
  }

  /**
   * enSuelo()
   * -------------------------------------------------------------------------
   * Comprueba si el personaje está tocando el suelo.
   * @returns {boolean}
   */
  enSuelo() {
    return this.y >= this.altojuego - this.altoSprite - 32;
  }
}
