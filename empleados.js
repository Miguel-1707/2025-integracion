//Reloj
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




  const params = new URLSearchParams(window.location.search);
  const tipo = params.get('tipo'); // "entrada" o "salida"
  
document.addEventListener('DOMContentLoaded', function () {
    const formEmpleado = document.getElementById('form-empleado');
    const codigoEmpleadoInput = document.getElementById('codigo-empleado');
    const bienvenidaEmpleado = document.getElementById('bienvenida-empleado');
    const nombreEmpleadoSpan = document.getElementById('nombre-empleado');
    const departamentoEmpleadoSpan = document.getElementById('departamento-empleado');
    const rolEmpleadoSpan = document.getElementById('rol-empleado');

    formEmpleado.addEventListener('submit', function (event) {
        event.preventDefault(); 

        const codigoEmpleado = codigoEmpleadoInput.value; 

        
        fetch('http://localhost:3000/acceso-empleado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cedula: codigoEmpleado,
                tipo : tipo
            }),
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.mensaje) {
                
                bienvenidaEmpleado.style.display = 'block';
                nombreEmpleadoSpan.textContent = data.nombre;
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error al registrar acceso:', error);
            alert('Hubo un error al intentar acceder.');
        });
    });
});
