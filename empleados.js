const empleados = {
    "123": {nombre:"Miguel Gonzalez"},
    "456": {nombre:"Norma De Anda"}
};

document.getElementById("form-empleado").addEventListener("submit", function() {
    var codigo = document.getElementById("codigo-empleado").value;

    if (empleados[codigo]) {
        document.getElementById("bienvenida-empleado").style.display = "block";
        document.getElementById("empleado-form-container").style.display = "none";

        document.getElementById("nombre-empleado").textContent = empleados[codigo].nombre;
    } else {
        alert("Código de empleado incorrecto. Por favor, intentalo nuevamente");
    }
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