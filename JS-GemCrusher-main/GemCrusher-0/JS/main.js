/*───────────────────────────────  Configuración básica  ───────────────────────────────*/

// Importamos la clase Gema que define la “vista-modelo” de cada celda del tablero
import { Gema } from "./gema.js";

// Referencia al contenedor HTML (<div id="tablero">) donde se pintarán las gemas
const tablero = document.getElementById("tablero");

// Dimensiones del tablero (filas y columnas) → 8×8 estilo clásico “match-3”
const FILAS = 8;
const COLUMNAS = 8;

// Clases CSS que representan los distintos colores de gemas disponibles
// (deben existir en stylesheet.css con estilos de fondo / sprite correspondientes)
const colores = [
    "gema--red",
    "gema--purple",
    "gema--yellow",
    "gema--blue",
    "gema--green",
    "gema--orange"
];

/*───────────────────────────────  Estado del juego  ───────────────────────────────*/

// Matriz lógica [fila][columna] que guarda SOLO el color de cada gema
// (mantiene la “verdad” del juego; el DOM se actualiza en función de esta)
let tableroLogico = [];

// Referencia a la gema actualmente seleccionada por el jugador (o null si ninguna)
let seleccionada = null;

// Array que guarda las coordenadas de gemas que forman un combo encontrado
//   Ej. combos = [[2,4], [2,5], [2,6]]  → tres gemas horizontales en fila 2
let combos = [];


/*───────────────────────────────────────────────────────────────
 * 1. Poblado inicial del tablero lógico
 *    - Creamos una matriz `tableroLogico` de tamaño FILAS × COLUMNAS
 *    - Asignamos un color aleatorio permitido a cada celda
 *    - Repetimos todo el llenado si al terminar se detecta
 *      al menos un combo, para garantizar que el tablero inicial
 *      NO tenga grupos de 3+ gemas adyacentes.
 *───────────────────────────────────────────────────────────────*/
do {
    for (let i = 0; i < FILAS; i++) {          // Recorre las filas
        tableroLogico[i] = [];                 // Prepara fila vacía
        for (let j = 0; j < COLUMNAS; j++) {   // Recorre las columnas
            const idxColor = Math.floor(Math.random() * colores.length);
            tableroLogico[i][j] = colores[idxColor]; // Color aleatorio
        }
    }
} while (buscarCombos().length > 0);           // Reintentamos si hay matches

/*───────────────────────────────────────────────────────────────
 * 2. Creación de elementos visuales (<div.gema>)
 *    - Por cada celda del tablero lógico instanciamos un objeto Gema
 *    - Su constructor genera el <div> con la clase de color correspondiente
 *    - Añadimos un listener de clic que delega en `clickGema`
 *    - Insertamos el nodo en el contenedor `tablero`
 *───────────────────────────────────────────────────────────────*/
for (let i = 0; i < FILAS; i++) {
    for (let j = 0; j < COLUMNAS; j++) {
        const gema = new Gema(i, j, tableroLogico[i][j]); // modelo + vista
        gema.elDiv.addEventListener("click", clickGema);  // interacción
        tablero.appendChild(gema.elDiv);                  // al DOM
    }
}

/**
 * Manejador principal de clic sobre una gema
 * ───────────────────────────────────────────
 *  Flujo general:
 *   1. Detecta si el clic fue sobre una gema ya seleccionada → des-selecciona.
 *   2. Si ya hay otra gema previamente seleccionada → intenta intercambiarlas,
 *      busca combos resultantes y los elimina si existen.
 *   3. Si no hay gema previa → marca la gema actual como seleccionada.
 *
 *  Globals usados:
 *    • `seleccionada` : HTMLElement | null
 *        Guarda la gema que el jugador tiene “en la mano”.
 *    • `combos`       : Array<[fila, col]>
 *        Coordenadas de gemas que forman parte de un match.
 *    • `cambiarGemas(a, b)` : Función que intercambia lógicamente dos gemas.
 *    • `buscarCombos()`     : Devuelve un arreglo de coordenadas de matches.
 *    • `borrarCombos()`     : Marca en la lógica y refresca el DOM.
 */
function clickGema(event) {
    const gema = event.target; // Nodo HTML sobre el que se hizo clic

    /*────────────────────────────────────────────────────────────
     * 1. Caso: el jugador hace clic en la misma gema por segunda vez
     * → se cancela la selección.
     *───────────────────────────────────────────────────────────*/
    if (gema.classList.contains("seleccionada")) { //
        gema.classList.remove("seleccionada"); //
        seleccionada = null; // Nada está seleccionado

        /*────────────────────────────────────────────────────────────
         * 2. Caso: ya hay una gema seleccionada distinta ('seleccionada')
         * y se ha hecho clic en una nueva ('gema').
         * → intentamos intercambiarlas y resolver el turno.
         *───────────────────────────────────────────────────────────*/
    } else if (seleccionada) { //
        const filaGemaActual = parseInt(gema.dataset.fila);
        const colGemaActual = parseInt(gema.dataset.columna);
        const filaGemaSeleccionada = parseInt(seleccionada.dataset.fila);
        const colGemaSeleccionada = parseInt(seleccionada.dataset.columna);

        // Verificar si son adyacentes (misma columna y filas contiguas, O misma fila y columnas contiguas)
        const esAdyacente =
            (colGemaActual === colGemaSeleccionada && Math.abs(filaGemaActual - filaGemaSeleccionada) === 1) ||
            (filaGemaActual === filaGemaSeleccionada && Math.abs(colGemaActual - colGemaSeleccionada) === 1);

        if (esAdyacente) {
            // ❶ Intercambio de posiciones (en DOM y en matriz lógica)
            cambiarGemas(seleccionada, gema); //

            // ❷ Detección de combos tras el intercambio
            let combosDetectados = buscarCombos(); //

            if (combosDetectados.length > 0) {
                // ✅ Jugada válida: El intercambio formó combos.
                combos = combosDetectados; // Actualizar la variable global de combos

                // ❸ Procesar combos en cascada: Mientras haya combos, los eliminamos y hacemos caer nuevas gemas.
                while (combos.length > 0) { //
                    console.log("Se borrarán combos");
                    borrarCombos(); //
                    bajarGemas();   // Llama a la función que hace caer las gemas y rellena
                    combos = buscarCombos(); // Buscar nuevos combos después de la caída y relleno
                }

                // ❹ Limpieza de estado de selección tras efectuar la jugada válida
                seleccionada.classList.remove("seleccionada"); //
                seleccionada = null; //

            } else {
                // ❌ Jugada inválida: El intercambio no formó combos. Revertir.
                console.log("Intercambio no formó combos. Revirtiendo.");
                cambiarGemas(gema, seleccionada); // Intercambia de nuevo para revertir al estado original

                // Política de selección después de un intento inválido:
                // Deseleccionar la primera gema y seleccionar la segunda (la que se intentó mover).
                // Esto da al jugador la sensación de que su último clic es el que tiene el foco.
                seleccionada.classList.remove("seleccionada");
                gema.classList.add("seleccionada");
                seleccionada = gema;
            }
        } else {
            // No son adyacentes.
            // Política común: Deseleccionar la gema previamente seleccionada ('seleccionada')
            // y seleccionar la nueva gema clicada ('gema').
            seleccionada.classList.remove("seleccionada");
            gema.classList.add("seleccionada");
            seleccionada = gema;
        }

        /*────────────────────────────────────────────────────────────
         * 3. Caso: no había gema previa seleccionada
         * → marcamos la actual para un posible intercambio posterior.
         *───────────────────────────────────────────────────────────*/
    } else {
        gema.classList.add("seleccionada"); //
        seleccionada = gema; //
    }
}


/**
 * Intercambia los **colores** de dos gemas (visual + lógica)
 * ───────────────────────────────────────────────────────────
 *  ↳ No mueve los nodos en el DOM ni cambia sus coordenadas,
 *    solo “pinta” cada gema con el color de la otra y actualiza
 *    la matriz `tableroLogico` para que ambas fuentes de verdad
 *    permanezcan sincronizadas.
 *
 *  Parámetros:
 *    @param {HTMLElement} gema1 – Primer nodo .gema seleccionado
 *    @param {HTMLElement} gema2 – Segundo nodo .gema seleccionado
 *
 *  Flujo:
 *    1. Leer fila, columna y color actuales de ambas gemas (data-*).
 *    2. Hacer swap de clases CSS de color con `classList.replace`.
 *    3. Actualizar `data-color` de cada gema.
 *    4. Reflejar el cambio en la matriz lógica (`tableroLogico`).
 *
 *  Importante:
 *   • Elegimos **“swap de colores”** en vez de mover nodos porque
 *     el grid CSS posiciona cada gema según data-fila/columna;
 *     así evitamos reflows y mantenemos la cuadrícula estable.
 */
function cambiarGemas(gema1, gema2) {

    /*───────────────────────────────────
     * 1. Extraer posiciones y colores
     *───────────────────────────────────*/
    const fila1 = gema1.dataset.fila;       // Índice de fila (string → OK para acceso)
    const col1 = gema1.dataset.columna;    // Índice de columna
    const color1 = gema1.dataset.color;      // Clase CSS de color actual

    const fila2 = gema2.dataset.fila;
    const col2 = gema2.dataset.columna;
    const color2 = gema2.dataset.color;

    /*───────────────────────────────────
     * 2. Intercambiar colores en el DOM
     *───────────────────────────────────*/
    //   gema1 toma el color de gema2
    gema1.classList.replace(color1, color2); // quita color1 y pone color2 en un solo paso
    gema1.dataset.color = color2;            // actualiza atributo data-color

    //   gema2 toma el color de gema1
    gema2.classList.replace(color2, color1);
    gema2.dataset.color = color1;

    /*───────────────────────────────────
     * 3. Sincronizar la matriz lógica
     *───────────────────────────────────*/
    tableroLogico[fila1][col1] = color2;     // Posición (fila1,col1) ahora es color2
    tableroLogico[fila2][col2] = color1;     // Posición (fila2,col2) ahora es color1
}


/****************************************************************************************
 * buscarCombos()
 * -----------------------------------------------------------------------------
 * Recorre el tablero lógico y devuelve un arreglo con TODAS las coordenadas que
 * forman parte de un “combo” (3 o más gemas contiguas del mismo color) tanto en
 * horizontal como en vertical.  Los combos se devuelven como pares [fila, col].
 *
 * Flujo:
 *   1. Llama a busquedaHorizontal() para añadir combos horizontales a `combos`.
 *   2. Llama a busquedaVertical()   para añadir combos verticales   a `combos`.
 *   3. Elimina duplicados (una gema puede pertenecer a un combo vertical y a
 *      uno horizontal a la vez) y devuelve el arreglo resultante.
 ****************************************************************************************/
function buscarCombos() {
    let combos = [];                 // ← se irán acumulando aquí

    // 1. Explorar filas   (izq→der)
    busquedaHorizontal(combos);

    // 2. Explorar columnas (arriba→abajo)
    busquedaVertical(combos);

    // 3. Quitar duplicados: serializamos cada par con JSON.stringify,
    //    aplicamos un Set, y luego deserializamos.
    const unicos = [...new Set(combos.map(JSON.stringify))].map(JSON.parse);
    return unicos;
}

/****************************************************************************************
 * busquedaVertical(combos)
 * -----------------------------------------------------------------------------
 * Detecta cadenas verticales de 3 o más gemas iguales y añade sus coordenadas
 * al arreglo `combos` recibido por referencia.
 ****************************************************************************************/
function busquedaVertical(combos) {
    // Recorremos cada COLUMNA por separado
    for (let j = 0; j < COLUMNAS; j++) {

        let referencia = null;   // color de la gema que “lidera” la cadena actual
        let cadena = 0;      // longitud de la cadena vertical en curso

        // Recorremos las FILAS de arriba hacia abajo
        for (let i = 0; i < FILAS; i++) {
            if (i === 0) {
                // Primer elemento de la columna ⇒ establecemos referencia
                referencia = tableroLogico[i][j];
                cadena = 1;
            } else {
                if (tableroLogico[i][j] === referencia) {
                    // Mismo color ⇒ extendemos la cadena
                    cadena++;
                } else {
                    // Color distinto ⇒ evaluamos la cadena que acaba de terminar
                    if (cadena >= 3) {
                        // Añadimos todas las gemas de la cadena al arreglo de combos
                        for (let k = 0; k < cadena; k++) {
                            combos.push([(i - 1) - k, j]); // desde la gema anterior hacia arriba
                        }
                    }
                    // Reiniciamos referencia y longitud para el nuevo color
                    referencia = tableroLogico[i][j];
                    cadena = 1;
                }
            }
        }

        // Al terminar la columna confirmamos si la última cadena (hasta el borde)
        // también constituye un combo.
        if (cadena >= 3) {
            for (let k = 0; k < cadena; k++) {
                combos.push([(FILAS - 1) - k, j]);
            }
        }
    }
}

/****************************************************************************************
 * busquedaHorizontal(combos)
 * -----------------------------------------------------------------------------
 * Detecta cadenas horizontales de 3 o más gemas iguales y añade sus coordenadas
 * al arreglo `combos` recibido por referencia.
 ****************************************************************************************/
function busquedaHorizontal(combos) {
    // Recorremos cada FILA por separado
    for (let i = 0; i < FILAS; i++) {

        let referencia = null;  // color que encabeza la cadena horizontal
        let cadena = 0;     // longitud de la cadena

        // Recorremos las COLUMNAS de izquierda a derecha
        for (let j = 0; j < COLUMNAS; j++) {
            if (j === 0) {
                // Primer elemento de la fila ⇒ nueva referencia
                referencia = tableroLogico[i][j];
                cadena = 1;
            } else {
                if (tableroLogico[i][j] === referencia) {
                    // Mismo color ⇒ extendemos la cadena
                    cadena++;
                } else {
                    // Color distinto ⇒ evaluamos posible combo
                    if (cadena >= 3) {
                        for (let k = 0; k < cadena; k++) {
                            combos.push([i, (j - 1) - k]); // desde la gema anterior hacia la izq.
                        }
                    }
                    // Reiniciamos referencia y longitud
                    referencia = tableroLogico[i][j];
                    cadena = 1;
                }
            }
        }

        // Fin de fila: comprobamos si la cadena llega hasta el borde
        if (cadena >= 3) {
            for (let k = 0; k < cadena; k++) {
                combos.push([i, (COLUMNAS - 1) - k]);
            }
        }
    }
}

/**
 * Elimina las gemas marcadas en el arreglo global `combos`
 * ─────────────────────────────────────────────────────────
 *  1. Recorre cada coordenada almacenada en `combos`.  
 *  2. Para cada par [fila, columna]:
 *       • Cambia el valor de la celda en `tableroLogico`
 *         a la constante "gema--matada", que indica una casilla vacía
 *         o lista para animación de desaparición.  
 *  3. Al finalizar la actualización de la lógica, invoca `actualizarTablero()`
 *     para que la vista (DOM) refleje el nuevo estado.
 *
 *  Notas:
 *  ──────
 *  • Se asume que `combos` ya no contiene duplicados; de lo contrario,
 *    la misma gema se “mataría” varias veces (inofensivo pero innecesario).
 *  • Si planeas animar la caída de nuevas gemas antes de refrescar el DOM,
 *    podrías retrasar la llamada a `actualizarTablero()` o encadenarla a una
 *    promesa que espere la animación de fade-out.
 *  • Devuelve void porque la función actúa por efectos secundarios
 *    (modifica `tableroLogico` y el DOM indirectamente).
 */
function borrarCombos() {
    // ❶ Iteramos sobre cada combo detectado (par de coordenadas [fila, columna])
    combos.forEach((combo) => {
        const fila = combo[0];   // Índice de fila en la matriz lógica
        const columna = combo[1];   // Índice de columna en la matriz lógica

        // ❷ Marcar la celda como eliminada en la lógica del juego
        tableroLogico[fila][columna] = "gema--matada";
        //       ↑ Esta cadena especial servirá para que 'actualizarTablero'
        //         aplique la clase CSS correspondiente y/o lance la animación
    });

    // ❸ Reflejar visualmente los cambios en el tablero
    actualizarTablero();
}

/**
 * actualizarTablero()
 * -----------------------------------------------------------------------------
 * Mantiene sincronizada la parte visual (<div class="gema">) con la matriz
 * `tableroLogico`. Debe ejecutarse SIEMPRE que cambie el estado del juego,
 * ya sea tras eliminar combos, bajar gemas o generar piezas nuevas.
 *
 * Flujo general:
 *   1.  Seleccionar TODAS las gemas que existen actualmente en el DOM.
 *   2.  Para cada gema:
 *       a.  Leer su posición (fila, columna) desde los atributos data-*.
 *       b.  Obtener en `tableroLogico` el color que debería tener.
 *       c.  Aplicar los cambios de clase y animación necesarios
 *           - “gema--matada”  → anima la desaparición.
 *           - Color normal    → actualiza clase y, si reaparece, anima pop-in.
 */
function actualizarTablero() {
    /* ❶ Selección estática de todos los nodos .gema dentro del contenedor
     *    `tablero`.  querySelectorAll devuelve un NodeList “vivo” *en el
     *    momento de la llamada*; si más gemas aparecen luego, habrá que
     *    llamar de nuevo a actualizarTablero para reflejarlo. */
    const gemas = tablero.querySelectorAll(".gema");

    /* ❷ Recorremos el NodeList.  forEach es seguro porque NodeList implementa
     *    la interfaz Iterable; no es necesario convertirlo a Array. */
    gemas.forEach((gema) => {

        /* ❷a Fila y columna vienen como *strings* desde data-attributes;
         *     JavaScript los acepta como índices de array sin convertirlos,
         *     pero si se quisiera hacer aritmética habría que usar Number(). */
        const fila     = gema.dataset.fila;
        const columna  = gema.dataset.columna;

        /* ❷b Color “de verdad” que debería tener la gema de acuerdo con la
         *     lógica del juego.  En tu implementación, “gema--matada” actúa
         *     como un SENTRY para un hueco vacío pendiente de rellenarse. */
        const color = tableroLogico[fila][columna];

        /* ❷c Sincronización visual
         * ---------------------------------------------------------------
         * Dos casos: la celda está vacía (“gema--matada”) o tiene un color
         * válido.  En ambos, se actualiza:
         *   - classList        → para que el CSS pinte el color correcto
         *   - dataset.color    → para no perder el estado al siguiente ciclo
         */

        /* CASO 1 — Desaparición de la gema (pop-out corto) */
        if (color === "gema--matada") {
            // Elimina la clase de color actual (rojo, verde, etc.)
            gema.classList.remove(gema.dataset.color);

            // Añade la clase que dispara la animación @keyframes pop-out
            gema.classList.add("gema--matada");

            // Guarda el nuevo “color” en el dataset para futuras lecturas
            gema.dataset.color = "gema--matada";
        }

        /* CASO 2 — Hay un color normal en la celda */
        else {
            const colorAnterior = gema.dataset.color;          // antes del update
            const reaparece     = colorAnterior === "gema--matada";
            //      ^ true cuando la gema venía de un hueco vacío y “renace”

            // 1) En caso de que la gema estuviera marcada como matada,
            //    quitamos esa clase para que el CSS vuelva a colorearla.
            gema.classList.remove("gema--matada");

            // 2) Sustituimos la clase de color viejo por el nuevo.
            //    Nota: replace no hace nada si colorAnterior == color.
            gema.classList.replace(colorAnterior, color);

            // 3) Aseguramos ID: si por algún motivo la gema no tenía
            //    la clase de destino (p. ej. cambio manual en DevTools),
            //    la volvemos a añadir.
            gema.classList.add(color);

            // 4) Persistimos el color en el dataset
            gema.dataset.color = color;

            /* Animación “pop-in” — sólo si la gema reaparece tras haber sido
             * eliminada.  Se realiza con un pequeño truco:
             *     - Se fija transform:scale(0.3) SIN transición.
             *     - requestAnimationFrame() espera un *tick* de render.
             *     - En el siguiente frame se añade la transición y se escala
             *       a 1, logrando un efecto suave sin parpadeos.
             */
            if (reaparece) {
                gema.style.transform = "scale(0.3)"; // estado inicial

                requestAnimationFrame(() => {
                    // Activamos la transición justo después del primer layout
                    gema.style.transition = "transform 0.2s ease-out";
                    gema.style.transform  = "scale(1)";           // destino

                    // Limpieza: quitamos la transición cuando acabe para que
                    // futuras transformaciones (caídas, etc.) no se encadenen.
                    gema.addEventListener(
                        "transitionend",
                        () => (gema.style.transition = ""),
                        { once: true }      // se auto-destruye tras dispararse
                    );
                });
            }
        }
    });
}


/**
 * bajarGemas()
 * -----------------------------------------------------------------------------
 * “Hace caer” las gemas en la matriz `tableroLogico` hasta rellenar todos los
 * huecos marcados como "gema--matada".  Después sincroniza el DOM y aplica la
 * animación de caída a cada gema que realmente se desplazó.
 *
 *   - Trabaja **solo** sobre la matriz lógica; el DOM se refresca con
 *     `actualizarTablero()`.
 *   - El algoritmo recorre cada columna de abajo hacia arriba; cuando
 *     encuentra un hueco, *“sube”* todo lo que está arriba una fila.
 *   - Para cada gema que se mueve registra cuántos pasos (filas) cae, de modo
 *     que más tarde se pueda animar con CSS usando la custom property --pasos.
 */
function bajarGemas() {
    /* Array de movimientos que luego serán animados.
     * Cada entrada → { nodo: <div.gema>, pasos: <int> }
     * Si no localizamos el nodo (p.ej. no existe todavía en el DOM),
     * lo ignoraremos más adelante. */
    const movimientos = [];

    /* ❶-❷ Recorrido por columnas (j) y filas (i) de abajo ↑ arriba.
     *     Empieza en la última fila (FILAS - 1) para que los huecos
     *     absorban inmediatamente lo que hay encima. */
    for (let j = 0; j < COLUMNAS; j++) {
        for (let i = FILAS - 1; i >= 0; i--) {

            /* Mientras permanezca un hueco en (i,j) seguimos “tirando” de todo
             * lo que esté encima.  Un solo while evita múltiples pasadas. */
            while (tableroLogico[i][j] === "gema--matada") {

                /* ❸ Bucle interno que desplaza una columna entera UNA FILA:
                 *     k reemplaza celda (k,j) con el valor de (k-1,j). */
                for (let k = i; k >= 0; k--) {

                    /* k === 0 → hemos llegado al borde superior.
                     * Creamos una gema ESPECIAL: color nuevo aleatorio. */
                    if (k === 0) {
                        const idx = Math.floor(Math.random() * colores.length);
                        tableroLogico[0][j] = colores[idx];
                    } else {
                        // Copia la gema (o hueco) superior hacia abajo
                        tableroLogico[k][j] = tableroLogico[k - 1][j];

                        /* ► Registro para animación:
                         *    Solo lo hacemos si la celda (k-1,j) *contenía*
                         *    una gema real (≠ "gema--matada"), es decir,
                         *    un elemento visible que se moverá. */
                        if (tableroLogico[k - 1][j] !== "gema--matada") {
                            const nodo = tablero.querySelector(
                                `.gema[data-fila='${k - 1}'][data-columna='${j}']`
                            );
                            /* Cada “salto” de una gema en este bucle mueve
                             * exactamente UNA fila ⇒ pasos = 1.  Si en tu
                             * versión futura optimizas varios saltos de una
                             * vez, acumula en `pasos` el desplazamiento real. */
                            movimientos.push({ nodo, pasos: 1 });
                        }
                    }
                } // fin for k
            } // fin while hueco
        }
    }

    /* ❹ La matriz lógica ya está lista, ahora actualizamos el DOM.
     *     Aquí es donde las .gema reciben sus nuevas grid-row/col. */
    actualizarTablero();

    /* ❺ Se dispara la animación “drop” en cada gema desplazada.
     *     La animación usa la variable CSS --pasos para saber
     *     cuántas alturas de gema debe recorrer con translateY. */
    movimientos.forEach(({ nodo, pasos }) => {
        if (!nodo) return;                        // Nodo inexistente → saltar
        nodo.style.setProperty("--pasos", pasos); // p.ej. --pasos: 1
        nodo.classList.add("gema--cae");          // dispara @keyframes drop

        /* Limpieza automática de la clase para que futuras caídas
         * repliquen la animación (sin encadenar múltiples veces). */
        nodo.addEventListener(
            "animationend",
            () => nodo.classList.remove("gema--cae"),
            { once: true }
        );
    });
}



