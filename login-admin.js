document.addEventListener('DOMContentLoaded', function() { // Asegúrate de que el DOM esté cargado
    const adminLoginForm = document.getElementById('admin-login-form');
    const userInput = document.getElementById('user-admin-login');
    const passInput = document.getElementById('pass-admin-login');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Ocultar mensajes al cargar la página (asegurar)
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    if (adminLoginForm) { // Verificar que el formulario existe
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevenir la recarga de la página

            // Ocultar mensajes de intentos anteriores
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';

            const user = userInput.value;
            const pass = passInput.value;

            // Realizar la petición fetch al servidor para autenticar
            fetch('http://localhost:3000/login', { // URL de tu ruta de login en server.js
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ // Envía el nombre y la contraseña como JSON
                    nombre: user, // Asegúrate de que el campo se llama 'nombre' como espera tu server.js
                    pass: pass
                }),
            })
            .then(response => {
                // Tu servidor envía respuestas de texto, así que leemos response.text()
                // También necesitamos el estado de la respuesta (ok, 401, 500, etc.)
                return response.text().then(text => ({
                     status: response.status,
                     ok: response.ok, // true para estados 2xx, false para otros
                     text: text // El cuerpo de la respuesta (mensaje de éxito o error)
                }));
            })
            .then(data => {
                if (data.ok) { // Si la respuesta HTTP fue exitosa (estado 200)
                    successMessage.textContent = data.text; // Muestra el mensaje de éxito del servidor ("Login exitoso")
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';

                    // Redirigir después de un breve retraso
                    setTimeout(() => {
                        // Redirige a la página del panel de administrador
                        // Asegúrate de que 'admins.html' es la URL correcta para tu panel
                        window.location.href = 'admins.html';
                    }, 1500); // Redirige después de 1.5 segundos (ajusta si quieres)

                } else { // Si la respuesta HTTP indica un error (estado 400, 401, 500)
                    // Muestra el mensaje de error del servidor (ej: "Usuario no encontrado", "Contraseña incorrecta")
                    errorMessage.textContent = data.text || 'Error desconocido al iniciar sesión';
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                }
            })
            .catch(error => {
                // Este bloque maneja errores de red, el servidor no responde, etc.
                console.error('Error en la petición fetch de login:', error);
                errorMessage.textContent = 'Error de conexión con el servidor.';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            });
        });
    } else {
        console.error("Formulario de login de administrador no encontrado.");
    }
});