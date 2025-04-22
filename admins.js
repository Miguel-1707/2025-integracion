document.addEventListener("DOMContentLoaded", () => {
    const empleados = [
        { nombre: "Juan", apellidos: "Pérez", codigo: "789", puesto: "Seguridad", horario: "08:00 - 16:00", correo: "juan@empresa.com", telefono: "5551234567" },
        { nombre: "María", apellidos: "López", codigo: "741", puesto: "Recepcionista", horario: "09:00 - 17:00", correo: "maria@empresa.com", telefono: "5559876543" }
    ];

    let empleadoEncontrado = null;

    document.getElementById("form-busqueda").addEventListener("submit", function(e) {
        e.preventDefault();
        const busqueda = document.getElementById("busqueda-empleado").value.toLowerCase();
        empleadoEncontrado = empleados.find(emp =>
            emp.nombre.toLowerCase().includes(busqueda) ||
            emp.codigo.toLowerCase().includes(busqueda)
        );

        if (empleadoEncontrado) {
            document.getElementById("datos-empleado").textContent = `${empleadoEncontrado.nombre} ${empleadoEncontrado.apellidos}, Código: ${empleadoEncontrado.codigo}`;
            document.querySelector(".resultado-busqueda").style.display = "block";
            document.getElementById("no-encontrado").style.display = "none";
        } else {
            document.getElementById("no-encontrado").style.display = "block";
            document.querySelector(".resultado-busqueda").style.display = "none";
        }
    });

    // Botón editar → abre una nueva pestaña con datos en la URL
    document.getElementById("btn-editar").addEventListener("click", () => {
        if (empleadoEncontrado) {
            const params = new URLSearchParams(empleadoEncontrado).toString();
            window.open(`editar-empleado.html?${params}`, "_blank");
        }
    });

    // Botón eliminar → confirmación + eliminación
    document.getElementById("btn-eliminar").addEventListener("click", () => {
        if (empleadoEncontrado) {
            const confirmacion = confirm(`¿Estás seguro de eliminar a ${empleadoEncontrado.nombre}?`);
            if (confirmacion) {
                const index = empleados.indexOf(empleadoEncontrado);
                empleados.splice(index, 1);
                alert("Empleado eliminado");
                document.querySelector(".resultado-busqueda").style.display = "none";
            }
        }
    });

    // Botón agregar → abre una pestaña nueva
    document.getElementById("btn-agregar").addEventListener("click", () => {
        window.open("agregar-empleado.html", "_blank");
    });
});



//reloj
function actualizarReloj() {
    const fecha = new Date();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');
    const horaFormateada = `${horas}:${minutos}:${segundos}`;

    document.getElementById('reloj').textContent = horaFormateada;
}

// Actualizar el reloj cada segundo (1000 ms)
setInterval(actualizarReloj, 1000);

// Llamar una vez al inicio para que no esté en blanco al cargar la página
actualizarReloj();