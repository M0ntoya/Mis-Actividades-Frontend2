// ─────────────────────────────────────────────────────────────────────────────
// state.js
// Máquina de estados finita (FSM) que controla la lógica de animación y
// comportamiento del jugador.  Cada clase representa un “estado” que conoce:
//   • enter()       → se ejecuta al activar el estado (cambia sprite, resetea variables)
//   • handleInput() → procesa la última entrada del teclado y decide transiciones
//   • exit()        → (opcional) limpia o reajusta al abandonar el estado
// El jugador delega en su estadoActual estas tres responsabilidades.
// ─────────────────────────────────────────────────────────────────────────────

// Enumeración de índices para acceder al array this.estados[] dentro de Jugador.
// Facilita llamar setState() con un entero en lugar de instancias/clases.
export const states = {
  PARADO_IZQ: 0,
  PARADO_DER: 1,
  AGACHADO_IZQ: 2,
  AGACHADO_DER: 3,
  CAMINAR_IZQ: 4,
  CAMINAR_DER: 5,
  SALTAR_IZQ: 6,
  SALTAR_DER: 7,
  CAER_IZQ: 8,
  CAER_DER: 9,
};

// ─────────────────────────────────────────────────────────────────────────────
// Clase base State
// Guarda el nombre simbólico del estado y sirve como interfaz común para las
// subclases.  Las hijas SOBREESCRIBEN enter(), handleInput() y opcional exit().
// ─────────────────────────────────────────────────────────────────────────────
class State {
  constructor(state) {
    this.state = state; // Etiqueta legible para depuración
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Estados “quietos” (Idle)
// -----------------------------------------------------------------------------
// Estos estados representan al personaje completamente detenido sobre el suelo
// y mirando a una dirección específica.  Desde aquí puede:
//   • Iniciar desplazamiento (walk)     → al recibir la tecla contraria o afín.
//   • Agacharse (crouch)                → al presionar flecha ↓.
//   • Saltar (jump)                     → al presionar flecha ↑.
// Además, si por cualquier motivo la velocidad horizontal del jugador ya es
// distinta de cero (p. ej. una fuerza residual), la lógica corrige el estado
// para mantener la máquina de estados coherente con la física actual.
// ─────────────────────────────────────────────────────────────────────────────
export class ParadoIzq extends State {
  /**
   * @param {Jugador} jugador – Instancia del personaje principal.
   * El constructor solo guarda la referencia; la configuración visual ocurre
   * en enter() para asegurar que el sprite siempre se actualice al activar
   * el estado, incluso si re-entramos después de una transición fugaz.
   */
  constructor(jugador) {
    super('PARADO IZQ');
    this.jugador = jugador;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // enter()
  // Se ejecuta UNA sola vez al cambiar a este estado.  Ideal para:
  //   • Seleccionar la hoja de sprites correspondiente.
  //   • Reiniciar el contador de frames si fuera necesario.
  //   • Ajustar valores de animación (FPS, maxFrames).
  // No modifica velocidades: el personaje realmente está quieto.
  // ─────────────────────────────────────────────────────────────────────────
  enter() {
    // Elemento <img id="paradoIzquierda"> precargado en el HTML.
    this.jugador.spriteSheet = paradoIzquierda;
    this.jugador.maxFrames = 4;  // Idle loop de 4 fotogramas.
    console.log("Entrando en estado: " + this.state);
    if (this.jugador.caerEstilo) {
      console.log("Reiniciando caída con estilo");      
      this.jugador.direccionCaida = 0; // Reinicia dirección de caída
      this.jugador.velocidad = 0;       
    }
    this.jugador.caerEstilo = false; // Reinicia bandera de caída con estilo
    console.log("Caida estilo en estado parada:", this.jugador.caerEstilo);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // handleInput(input)
  // Recibe la ÚLTIMA tecla registrada por el InputHandler en formato:
  //   "PRESS right"   / "RELEASE right"
  //   "PRESS left"    / "RELEASE left"
  //   "PRESS up"
  //   "PRESS down"
  // Según la entrada, dispara transiciones mediante jugador.setState().
  // También revisa la velocidad horizontal para casos “externos” (empujones),
  // garantizando que la animación coincida con el movimiento real.
  // ─────────────────────────────────────────────────────────────────────────
  handleInput(input) {
    // ── Transiciones detonadas DIRECTAMENTE por teclado ──
    if (input === 'PRESS right') this.jugador.setState(states.CAMINAR_DER);
    else if (input === 'PRESS down') this.jugador.setState(states.AGACHADO_IZQ);
    else if (input === 'PRESS left') this.jugador.setState(states.CAMINAR_IZQ);
    else if (input === 'PRESS up') {   // Saltar
      this.jugador.saltando = true;
      this.jugador.setState(states.SALTAR_IZQ);
    }

    // ── Corrección basada en física: si ya hay velocidad, no debería estar Idle ──
    if (this.jugador.velocidad < 0 && !this.caerEstilo){
      this.jugador.setState(states.CAMINAR_IZQ);
    } 
  }
}

export class ParadoDer extends State {
  constructor(jugador) {
    super('PARADO DER');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('paradoDerecha');
    this.jugador.maxFrames = 4;
    if (this.jugador.caerEstilo) {      
      this.jugador.direccionCaida = 0; // Reinicia dirección de caída
      this.jugador.velocidad = 0; 
    }
    this.jugador.caerEstilo = false; // Reinicia bandera de caída con estilo
  }

  handleInput(input) {
    // Entradas de usuario que provocan cambio de estado
    if (input === 'PRESS left') this.jugador.setState(states.CAMINAR_IZQ);
    else if (input === 'PRESS down') this.jugador.setState(states.AGACHADO_DER);
    else if (input === 'PRESS right') this.jugador.setState(states.CAMINAR_DER);
    else if (input === 'PRESS up') {
      this.jugador.saltando = true;
      this.jugador.setState(states.SALTAR_DER);
    }

    // Ajuste de coherencia con la física (por ejemplo, empujones)
    if (this.jugador.velocidad > 0 && !this.caerEstilo) this.jugador.setState(states.CAMINAR_DER);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. Estados “agachados” (crouch)
// ─────────────────────────────────────────────────────────────────────────────
export class AgachadoDer extends State {
  constructor(jugador) {
    super('AGACHADO DER');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('agachadoDerecha');
    this.jugador.fps = 8;  // Velocidad de animación
    this.jugador.maxFrames = 3;
  }

  handleInput(input) {
    if (input === 'PRESS left') this.jugador.setState(states.CAMINAR_IZQ);
    else if (input === 'PRESS right') this.jugador.setState(states.CAMINAR_DER);
    else if (input === 'RELEASE down') this.jugador.setState(states.PARADO_DER);
  }
}

export class AgachadoIzq extends State {
  constructor(jugador) {
    super('AGACHADO IZQ');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('agachadoIzquierda');
    this.jugador.fps = 8;
    this.jugador.maxFrames = 3;
  }

  handleInput(input) {
    if (input === 'PRESS right') this.jugador.setState(states.CAMINAR_DER);
    else if (input === 'PRESS left') this.jugador.setState(states.CAMINAR_IZQ);
    else if (input === 'RELEASE down') this.jugador.setState(states.PARADO_IZQ);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Estados “caminar” (walk) — con movimiento continuo
// ─────────────────────────────────────────────────────────────────────────────
export class CaminarIzq extends State {
  constructor(jugador) {
    super('CAMINAR IZQ');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('caminarIzquierda');
    this.jugador.velocidad = -this.jugador.maxVelocidad; // Movimiento ←
    this.jugador.fps = 16;
    this.jugador.maxFrames = 7;
    this.jugador.caerEstilo = false; // Reinicia caída con estilo
  }

  handleInput(input) {
    if (input === 'PRESS right') this.jugador.setState(states.CAMINAR_DER);
    else if (input === 'PRESS down') this.jugador.setState(states.AGACHADO_IZQ);
    else if (input === 'RELEASE left') this.jugador.setState(states.PARADO_IZQ);
    else if (input === 'PRESS up') {
      this.jugador.saltando = true;
      this.jugador.setState(states.SALTAR_IZQ);
    }
  }

  // Se ejecuta al abandonar el estado; detiene velocidad si no fue salto
  exit() {
    if (!this.jugador.saltando) this.jugador.velocidad = 0;
  }
}

export class CaminarDer extends State {
  constructor(jugador) {
    super('CAMINAR DER');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('caminarDerecha');
    this.jugador.velocidad = this.jugador.maxVelocidad; // Movimiento →
    this.jugador.fps = 16;
    this.jugador.maxFrames = 7;
    this.jugador.caerEstilo = false; // Reinicia caída con estilo
  }

  handleInput(input) {
    if (input === 'PRESS left') this.jugador.setState(states.CAMINAR_IZQ);
    else if (input === 'PRESS down') this.jugador.setState(states.AGACHADO_DER);
    else if (input === 'RELEASE right') this.jugador.setState(states.PARADO_DER);
    else if (input === 'PRESS up') {
      this.jugador.saltando = true;
      this.jugador.setState(states.SALTAR_DER);
    }
  }

  exit() {
    if (!this.jugador.saltando) this.jugador.velocidad = 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Estados “saltar” (jump) — transición a “caer” cuando la velocidad vertical
//    cambia de signo (de ascendente a descendente).
// ─────────────────────────────────────────────────────────────────────────────
export class SaltarIzq extends State {
  constructor(jugador) {
    super('SALTAR IZQ');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('saltarIzquierda');
    this.jugador.velocidadSalto = this.jugador.maxVelocidadSalto; // Impulso ↑
    this.jugador.maxFrames = 6;
  }

  handleInput(input) {
    // Cuando la velocidadSalto pasa de negativa (subiendo) a positiva (bajando)
    if (this.jugador.velocidadSalto > 0)
      this.jugador.setState(states.CAER_IZQ);

    if (input === 'RELEASE left' && !this.jugador.caerEstilo && this.jugador.velocidad !== 0) {
      console.log("Liberando tecla izquierda, caer estilo activado");
      this.jugador.caerEstilo = true; // Bandera para caída con estilo
      this.jugador.direccionCaida = 1; // Dirección de caída a la izquierda, invertido para desaceleración
    }
  }
}

export class SaltarDer extends State {
  constructor(jugador) {
    super('SALTAR DER');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('saltarDerecha');
    this.jugador.velocidadSalto = this.jugador.maxVelocidadSalto;
    this.jugador.maxFrames = 6;
  }

  handleInput(input) {
    if (this.jugador.velocidadSalto > 0)
      this.jugador.setState(states.CAER_DER);

    if (input === 'RELEASE right' && !this.jugador.caerEstilo && this.jugador.velocidad !== 0) {
      this.jugador.caerEstilo = true; // Bandera para caída con estilo
      this.jugador.direccionCaida = -1; // Dirección de caída a la derecha, invertido para desaceleración
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Estados “caer” (fall) — espera hasta tocar suelo para volver a Parado.
// ─────────────────────────────────────────────────────────────────────────────
export class CaerIzq extends State {
  constructor(jugador) {
    super('CAER IZQ');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('caerIzquierda');
    this.jugador.maxFrames = 3;    
    this.jugador.saltando = false; // Bandera de salto off
  }

  handleInput(input) {
    if (this.jugador.enSuelo())
      this.jugador.setState(states.PARADO_IZQ);
    else if (input === 'RELEASE left' && !this.jugador.caerEstilo && this.jugador.velocidad !== 0) {
      this.jugador.caerEstilo = true; // Bandera para caída con estilo
      this.jugador.direccionCaida = 1; // Dirección de caída a la izquierda, invertido para desaceleración
      console.log("Liberando tecla izquierda en caída, caer estilo activado");
    }
  }
}

export class CaerDer extends State {
  constructor(jugador) {
    super('CAER DER');
    this.jugador = jugador;
  }

  enter() {
    this.jugador.spriteSheet = document.getElementById('caerDerecha');
    this.jugador.maxFrames = 3;
    this.jugador.saltando = false;
  }

  handleInput(input) {
    if (this.jugador.enSuelo())
      this.jugador.setState(states.PARADO_DER);

    else if (input === 'RELEASE right' && !this.jugador.caerEstilo && this.jugador.velocidad !== 0) {
      this.jugador.caerEstilo = true; // Bandera para caída con estilo
      this.jugador.direccionCaida = -1; // Dirección de caída a la derecha, invertido para desaceleración
    }
  }
}
