// Acciones del formulario de login
document.getElementById("admin-login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto (recarga de página)

    // Obtener las credenciales
    const user = document.getElementById("user-admin-login").value;
    const pass = document.getElementById("pass-admin-login").value;

    // Simulación de autenticación (esto debe ser reemplazado por lógica real)
    if (user === "admin" && pass === "1234") {
        document.getElementById("error-message").style.display = "none"; // Ocultar el mensaje de error
        document.getElementById("success-message").style.display = "block"; // Mostrar mensaje de éxito

        // Aquí puedes redirigir al panel de administración
        setTimeout(() => {
            window.location.href = 'admins.html'; // Redirige a la página del panel de administrador
        }, 1500); // Redirige después de 1.5 segundos
    } else {
        document.getElementById("success-message").style.display = "none"; // Ocultar el mensaje de éxito
        document.getElementById("error-message").style.display = "block"; // Mostrar mensaje de error
    }
});
