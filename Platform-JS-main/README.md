# Platform-JS 🎮  

### Prototipo educativo para un juego de plataformas con JavaScript y Canvas

Este repositorio contiene el código de un pequeño juego prototipo, diseñado especialmente para comprender las **bases fundamentales de las mecánicas en juegos de plataformas**, poniendo especial énfasis en la implementación de una máquina de estados finita (**State Machine**) para controlar las animaciones y estados del personaje principal.

---

## 🎯 Objetivos del Proyecto

- Entender y aplicar el patrón **Finite State Machine (FSM)** para gestionar estados complejos del jugador (idle, caminar, saltar, caer, agacharse).
- Implementar físicas básicas ficticias (gravedad y salto simple) usando `deltaTime`.
- Utilizar una arquitectura modular, clara y escalable para futuros desarrollos.
- Preparar un punto de partida sencillo para practicar la implementación de scroll infinito o desplazamiento horizontal del escenario.

---

## 🚀 Características Principales del Prototipo

- **Movimiento horizontal**: izquierda/derecha a velocidad constante.
- **Salto simple y gravedad básica**: sin físicas reales o detección de plataformas.
- **Agachado básico**: cambio visual únicamente, sin efecto en colisiones.
- **Máquina de estados clara y robusta** para gestionar todas las acciones del jugador.
- **Sprites y animaciones básicas**: precargados y fácilmente sustituibles.
- **Scroll del mapa**: parcialmente preparado para que sea implementado por los estudiantes como práctica.

---


---

## 🎬 La Máquina de Estados – El corazón del juego

La lógica principal del jugador está gestionada por una FSM que define claramente cada estado posible:

| Estado | Descripción                             | Transiciones posibles                        |
|--------|-----------------------------------------|----------------------------------------------|
| Idle   | Parado, mirando izquierda o derecha.    | → Caminar, Saltar, Agacharse                 |
| Caminar| Movimiento lateral continuo.            | → Idle, Saltar, Agacharse                    |
| Saltar | Movimiento vertical ascendente.         | → Caer                                       |
| Caer   | Movimiento vertical descendente.        | → Idle al contactar con el suelo             |
| Agachado | Posición visual agachada.             | → Idle, Caminar                              |

Cada estado tiene claramente definidas sus responsabilidades a través de tres métodos clave:

- `enter()` – Define cambios visuales y ajustes iniciales del estado.
- `handleInput(input)` – Decide cuándo y cómo cambiar a otro estado según la entrada del usuario.
- `exit()` (opcional) – Realiza ajustes o limpiezas al salir del estado.

---

## 🛠️ Desafíos para Estudiantes

Este prototipo es solo el punto de partida. Algunos retos propuestos para profundizar en los conceptos son:

- Implementar **scroll horizontal o parallax** en `mapa.js`.
- Desarrollar **colisiones básicas** con plataformas y objetos.
- Añadir mecánicas como **doble salto** o **dash lateral**.
- Crear efectos visuales adicionales, como partículas o animaciones especiales al aterrizar.

---

## 📌 Cómo ejecutar el proyecto

1. Clona este repositorio o descarga el ZIP.
2. Abre la carpeta del proyecto en tu editor favorito (VS Code recomendado).
3. Usa una extensión como **Live Server** para ejecutar el archivo `index.html`.
4. Abre tu navegador en `localhost:5500` (o el puerto que use tu servidor local).

---

**¡Diviértete aprendiendo y creando con Platform-JS! 🚀🕹️**

## Créditos

El asset **Ancient Forest 0.3** fue creado por [lukyaforge](https://lukyaforge.itch.io/ancientforest).  
Opcional, pero apreciado: considera calificar su trabajo en [itch.io](https://lukyaforge.itch.io/ancientforest).

El asset **Girl Knight Character Asset** fue creado por [JumpButton](https://jumpbutton.itch.io/girlknightasset).  
Opcional, pero apreciado: considera apoyar al creador en [Ko-fi](https://ko-fi.com/jump_button).
