document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, pass })
    });

    const result = await response.text();
    console.log('Resultado del servidor:', result); // Para depuración
    if (response.ok) {
        window.location.href = 'principal.html'; // o donde tú quieras redirigir
    } else {
        alert("El sistema dice: " + result); // Cambié el mensaje para que sea más claro
    }
});