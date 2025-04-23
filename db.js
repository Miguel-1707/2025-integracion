const mysql = require('mysql2'); //importacion de mysql2

// Creacion de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'miguel17', 
  password: '1707',
  database: 'control_acceso'
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conexión exitosa a la base de datos con ID ' + connection.threadId);
});

module.exports = connection;
