// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'miguel17',
    password: '1707',
    database: 'control_acceso'
});

// Ruta para login
app.post('/login', (req, res) => {
    const { nombre, pass } = req.body;

    if (!nombre || !pass) {
        return res.status(400).send('Faltan datos');
    }

    const query = 'SELECT * FROM administrador WHERE nombre = ?';
    db.query(query, [nombre], async (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error del servidor');
        }

        console.log('Resultados de la consulta:', results); // Asegúrate de que los resultados lleguen

        if (results.length === 0) {
            return res.status(401).send('Usuario no encontrado');
        }

        const usuario = results[0];

        if (pass !== usuario.pass) return res.status(401).send('Contraseña incorrecta');

        res.status(200).send('Login exitoso');
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
