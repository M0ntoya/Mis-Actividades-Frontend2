export class Gema {
    constructor(fila, columna, color) { 
        // Generar elementos
        this.elDiv = document.createElement("div");
        this.elDiv.classList.add("gema", color);
        this.elDiv.dataset.fila = fila;
        this.elDiv.dataset.columna = columna;       
        this.elDiv.dataset.color = color;
    }
}

