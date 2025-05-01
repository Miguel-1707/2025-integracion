const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  
  // Cambia el ícono de luna a sol y viceversa
  const icon = themeToggle.querySelector('i');
  if (document.body.classList.contains('light-theme')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
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

document.querySelectorAll('.onclick-entrada, .onclick-salidas').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('clicked'); // Y luego en CSS defines .clicked con animación
      setTimeout(() => btn.classList.remove('clicked'), 200);
    });
  });
  

function toggleOptions(id) {
    const options = document.getElementById(id);
    options.classList.toggle("show");
  }