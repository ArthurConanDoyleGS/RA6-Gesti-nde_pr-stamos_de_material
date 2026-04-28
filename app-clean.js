const CLAVE_LOCAL_STORAGE = "prestamosMaterialAula";
const prestamos = cargarPrestamosDesdeStorage();
let indiceEdicion = null;

const formularioPrestamo = document.getElementById("formularioPrestamo");
const nombreAlumnoInput = document.getElementById("nombreAlumno");
const materialSelect = document.getElementById("material");
const devueltoCheckbox = document.getElementById("devuelto");
const botonGuardar = document.getElementById("botonGuardar");
const botonCancelar = document.getElementById("botonCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");
const cuerpoTablaPrestamos = document.getElementById("cuerpoTablaPrestamos");
const estadoVacio = document.getElementById("estadoVacio");
const contenedorTabla = document.getElementById("contenedorTabla");
const contadorPrestamos = document.getElementById("contadorPrestamos");

const etiquetasMaterial = {
    cargador: "Cargador",
    raton: "Raton",
    portatil: "Portatil",
    otros: "Otros"
};

const etiquetasTurno = {
    manana: "Manana",
    tarde: "Tarde"
};

formularioPrestamo.addEventListener("submit", guardarPrestamo);
botonCancelar.addEventListener("click", cancelarEdicion);
cuerpoTablaPrestamos.addEventListener("click", gestionarAccionesTabla);

renderizarPrestamos();

function cargarPrestamosDesdeStorage() {
    const datosGuardados = localStorage.getItem(CLAVE_LOCAL_STORAGE);

    if (!datosGuardados) {
        return [];
    }

    try {
        const prestamosParseados = JSON.parse(datosGuardados);

        if (!Array.isArray(prestamosParseados)) {
            return [];
        }

        return prestamosParseados.filter((prestamo) => {
            return typeof prestamo?.nombreAlumno === "string"
                && Object.hasOwn(etiquetasMaterial, prestamo.material)
                && Object.hasOwn(etiquetasTurno, prestamo.turno)
                && typeof prestamo.devuelto === "boolean";
        });
    } catch {
        return [];
    }
}

function guardarPrestamosEnStorage() {
    localStorage.setItem(CLAVE_LOCAL_STORAGE, JSON.stringify(prestamos));
}

function guardarPrestamo(evento) {
    evento.preventDefault();

    const nombreAlumno = nombreAlumnoInput.value.trim();
    const material = materialSelect.value;
    const turnoSeleccionado = document.querySelector("input[name='turno']:checked");
    const devuelto = devueltoCheckbox.checked;

    if (nombreAlumno === "" || material === "" || !turnoSeleccionado) {
        alert("Todos los campos obligatorios deben estar informados.");
        return;
    }

    const prestamo = {
        nombreAlumno,
        material,
        turno: turnoSeleccionado.value,
        devuelto
    };

    if (indiceEdicion === null) {
        prestamos.push(prestamo);
    } else {
        prestamos[indiceEdicion] = prestamo;
    }

    guardarPrestamosEnStorage();
    reiniciarFormulario();
    renderizarPrestamos();
}

function renderizarPrestamos() {
    if (prestamos.length === 0) {
        cuerpoTablaPrestamos.innerHTML = "";
        estadoVacio.classList.remove("d-none");
        contenedorTabla.classList.add("d-none");
        contadorPrestamos.textContent = "0 prestamos registrados";
        return;
    }

    const filasHTML = prestamos.map((prestamo, indice) => {
        return `
            <tr>
                <td>${prestamo.nombreAlumno}</td>
                <td>${etiquetasMaterial[prestamo.material]}</td>
                <td>${etiquetasTurno[prestamo.turno]}</td>
                <td>
                    <span class="status-badge ${prestamo.devuelto ? "status-returned" : "status-pending"}">
                        ${prestamo.devuelto ? "Si" : "No"}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="btn btn-warning btn-sm" data-accion="editar" data-indice="${indice}">
                            Editar
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" data-accion="eliminar" data-indice="${indice}">
                            Borrar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    cuerpoTablaPrestamos.innerHTML = filasHTML;
    estadoVacio.classList.add("d-none");
    contenedorTabla.classList.remove("d-none");
    contadorPrestamos.textContent = `${prestamos.length} prestamo${prestamos.length === 1 ? "" : "s"} registrado${prestamos.length === 1 ? "" : "s"}`;
}

function gestionarAccionesTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) {
        return;
    }

    const indice = Number(boton.dataset.indice);
    const accion = boton.dataset.accion;

    if (accion === "editar") {
        cargarPrestamoEnFormulario(indice);
        return;
    }

    if (accion === "eliminar") {
        eliminarPrestamo(indice);
    }
}

function cargarPrestamoEnFormulario(indice) {
    const prestamo = prestamos[indice];

    nombreAlumnoInput.value = prestamo.nombreAlumno;
    materialSelect.value = prestamo.material;
    devueltoCheckbox.checked = prestamo.devuelto;

    document.querySelectorAll("input[name='turno']").forEach((radio) => {
        radio.checked = radio.value === prestamo.turno;
    });

    indiceEdicion = indice;
    tituloFormulario.textContent = "Editar prestamo";
    botonGuardar.textContent = "Actualizar prestamo";
    botonCancelar.classList.remove("d-none");
    nombreAlumnoInput.focus();
}

function eliminarPrestamo(indice) {
    prestamos.splice(indice, 1);
    guardarPrestamosEnStorage();

    if (indiceEdicion === indice) {
        reiniciarFormulario();
    } else if (indiceEdicion !== null && indice < indiceEdicion) {
        indiceEdicion -= 1;
    }

    renderizarPrestamos();
}

function cancelarEdicion() {
    reiniciarFormulario();
}

function reiniciarFormulario() {
    formularioPrestamo.reset();
    indiceEdicion = null;
    tituloFormulario.textContent = "Nuevo prestamo";
    botonGuardar.textContent = "Guardar prestamo";
    botonCancelar.classList.add("d-none");
}
