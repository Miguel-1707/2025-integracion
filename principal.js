
function toggleOptions(optionId) {
    const options = document.getElementById(optionId);
    options.classList.toggle('hidden');
    console.log("Options toggled:", optionId);
}

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