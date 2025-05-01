// server.js
// Backend para el sistema de control de accesos
// Este archivo contiene todas las rutas de API implementadas hasta ahora, incluyendo la generación de reportes Excel.
const express = require('express');
const cors = require('cors'); // Para permitir peticiones desde el frontend
const mysql = require('mysql2'); // Para interactuar con la base de datos MySQL
// const bcrypt = require('bcrypt'); // Descomentar si implementas hashing de contraseñas (RECOMENDADO)
const moment = require('moment'); // Para manejar fechas
const ExcelJS = require('exceljs'); // Para generar archivos Excel

const app = express();
const PORT = 3000; // Puerto en el que correrá el servidor (CORREGIDO)

// --- Middleware ---
// Configuración básica de CORS: Permite peticiones de tu frontend que probablemente corre en un puerto diferente.
// En producción, deberías configurar esto para permitir solo peticiones desde tu dominio.
app.use(cors());
// Middleware para parsear el cuerpo de las peticiones entrantes como JSON.
app.use(express.json());

// --- Conexión a la base de datos --- (CORREGIDO INICIO Y FIN)
const db = mysql.createConnection({
    host: 'localhost', // Dirección del servidor de la base de datos (ej: 'localhost', '127.0.0.1')
    user: 'miguel17', // Tu usuario de base de datos
    password: '1707', // Tu contraseña de base de datos
    database: 'control_acceso' // El nombre de tu base de datos
});

// Intentar conectar a la base de datos al iniciar el servidor
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        // Si la conexión a la BD es esencial para iniciar, podrías salir del proceso aquí
        // process.exit(1);
    } else {
        console.log('Conectado a la base de datos MySQL.');
    }
});

// --- Rutas de la API ---

// Ruta POST /login
// Usada para autenticar administradores desde login-admins.html.
// NOTA IMPORTANTE DE SEGURIDAD: Esta versión compara contraseñas en texto plano.
// Se recomienda encarecidamente implementar hashing seguro (ej. con bcrypt) para almacenar y verificar contraseñas.
app.post('/login', (req, res) => {
    const { nombre, pass } = req.body; // Espera 'nombre' y 'pass' en el cuerpo JSON

    // Validación básica: asegurar que se recibieron los datos necesarios
    if (!nombre || !pass) {
        console.log('Intento de login fallido: Faltan datos.');
        return res.status(400).send('Faltan datos (nombre o pass).');
    }

    // Consultar la tabla 'administrador' para encontrar al usuario por nombre
    const query = 'SELECT * FROM administrador WHERE nombre = ?';
    db.query(query, [nombre], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos para login:', err);
            return res.status(500).send('Error del servidor al buscar usuario.');
        }

        // Verificar si se encontró algún usuario con ese nombre
        if (results.length === 0) {
            // Si no se encontró, el usuario no existe
             console.log(`Intento de login fallido: Usuario "${nombre}" no encontrado.`);
            // Por seguridad, usar un mensaje genérico que no revele si el usuario existe
            return res.status(401).send('Usuario o contraseña incorrectos');
        }

        const usuario = results[0]; // El objeto usuario encontrado

        // *** COMPARACIÓN DE CONTRASEÑA (¡DEBE SER REEMPLAZADO POR HASHING!) ***
        // En lugar de 'pass !== usuario.pass', usarías algo como 'bcrypt.compare(pass, usuario.pass, ...)'
        if (pass !== usuario.pass) {
            // Si la contraseña no coincide
            console.log(`Intento de login fallido: Contraseña incorrecta para el usuario "${nombre}".`);
            return res.status(401).send('Usuario o contraseña incorrectos');
        }

        // Si las credenciales son correctas
        console.log(`Login exitoso para el usuario "${nombre}".`);
        // En una aplicación real, aquí se gestionaría la sesión (ej: emitir un token JWT)
        res.status(200).send('Login exitoso'); // Enviar respuesta de éxito al frontend (login-admin.js espera este texto)
    });
});


// Ruta POST /acceso-empleado
// Usada por empleadosEntradas.html y empleadosSalidas.html para registrar entradas/salidas de empleados.
app.post('/acceso-empleado', (req, res) => {
    // Espera 'cedula' del empleado y 'tipo' ('entrada' o 'salida') en el cuerpo JSON
    const { cedula, tipo } = req.body;

    // Validación: asegurar que se recibieron los datos necesarios
    if (!cedula || !tipo) {
        console.log('Intento de registro de acceso fallido: Faltan datos (cedula o tipo).');
        return res.status(400).json({ error: 'Código de empleado y tipo de acceso requeridos' });
    }

    // Validación: asegurar que el 'tipo' es uno de los valores permitidos por la BD
    if (tipo !== 'entrada' && tipo !== 'salida') {
        console.log(`Intento de registro de acceso fallido: Tipo inválido "${tipo}".`);
         return res.status(400).json({ error: 'Tipo de acceso inválido. Debe ser "entrada" o "salida".' });
    }

    // 1. Buscar al empleado por cédula para obtener su información (ID, área, nombre, etc.)
    const buscarEmpleado = `
        SELECT
            e.Id_empleados,
            e.nombre,
            e.apellido,
            e.cedula,
            p.nombre AS rol,
            d.nombre AS departamento,
            p.ID_area AS area_id -- Necesitamos el ID_area para el registro en la tabla 'accesos'
        FROM empleados e
        JOIN puesto p ON e.Id_puesto = p.ID_puesto
        JOIN departamentos d ON p.ID_departamento = d.Id_departamento
        WHERE e.cedula = ?
    `;

    db.query(buscarEmpleado, [cedula], (err, results) => {
        if (err) {
            console.error('Error al buscar empleado para registro de acceso:', err);
            return res.status(500).json({ error: 'Error del servidor al buscar empleado.' });
        }

        // Verificar si se encontró al empleado
        if (results.length === 0) {
            console.log(`Intento de registro de acceso fallido: Empleado con cédula "${cedula}" no encontrado.`);
            return res.status(404).json({ error: 'Empleado no encontrado con esa cédula.' });
        }

        const empleado = results[0]; // Datos del empleado encontrado

        // 2. Registrar el acceso (entrada o salida) en la tabla 'accesos'
        const registrarAcceso = `
            INSERT INTO accesos (Id_area, Id_empleado, fecha, tipo, hora, tipo_usuario)
            VALUES (?, ?, NOW(), ?, CURTIME(), 'empleado')
        `;

        // Ejecutar la consulta INSERT, pasando los valores correspondientes a los placeholders (?)
        // Los valores son: ID del área del empleado, ID del empleado, el tipo ('entrada'/'salida'), y el tipo de usuario fijo 'empleado'.
        db.query(registrarAcceso, [empleado.area_id, empleado.Id_empleados, tipo, 'empleado'], (err2, resultInsert) => {
            if (err2) {
                console.error('Error al registrar acceso en la base de datos:', err2);
                return res.status(500).json({ error: 'Error al registrar acceso en la base de datos.' });
            }

            console.log(`Acceso (${tipo}) registrado con éxito para empleado ID: ${empleado.Id_empleados} (Cédula: ${cedula}). ID de acceso generado: ${resultInsert.insertId}`);

            // Mensaje de éxito a enviar al cliente, personalizado según el tipo de acceso
            const mensajeExito = tipo === 'entrada'
                ? `¡Bienvenid@, ${empleado.nombre}!` // Mensaje para acceso de entrada
                : `¡Hasta pronto, ${empleado.nombre}!`; // Mensaje para acceso de salida

            // Enviar respuesta de éxito al cliente con los datos del empleado y el mensaje
            res.status(200).json({
                mensaje: mensajeExito, // El mensaje principal que el frontend muestra
                nombre: empleado.nombre, // Nombre del empleado para la visualización en frontend
                departamento: empleado.departamento || 'N/A', // Departamento del empleado (o 'N/A' si es NULL)
                rol: empleado.rol || 'N/A' // Rol del empleado (o 'N/A' si es NULL)
            });
        });
    });
});


// Ruta GET API /api/stats/daily-accesses
// Usada por admins.js para obtener datos agregados (conteo) por día, tipo de acceso y tipo de usuario para el gráfico de estadísticas.
// Acepta opcionalmente query parameters: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
app.get('/api/stats/daily-accesses', (req, res) => {
    console.log('Recibida petición GET para estadísticas de accesos diarios.');

    // Obtener el rango de fechas de los parámetros de la URL (query params). Si no se proporcionan, usar los últimos 30 días hasta hoy.
    // Usamos .clone() para asegurarnos de no modificar accidentalmente el objeto moment original
    const startDate = req.query.startDate
        ? moment(req.query.startDate).format('YYYY-MM-DD') // Formatear fecha de inicio si existe
        : moment().clone().subtract(30, 'days').format('YYYY-MM-DD'); // Fecha de inicio por defecto (hace 30 días)

    const endDate = req.query.endDate
        ? moment(req.query.endDate).format('YYYY-MM-DD') // Formatear fecha de fin si existe
        : moment().clone().format('YYYY-MM-DD'); // Fecha de fin por defecto (hoy)

    console.log(`Obteniendo estadísticas de accesos entre ${startDate} y ${endDate}`);

    // Consulta SQL para agrupar y contar accesos por fecha, tipo y tipo_usuario dentro del rango de fechas
    const query = `
        SELECT
            DATE(fecha) AS access_date, -- Extraer solo la fecha de la columna timestamp
            tipo, -- Tipo de acceso ('entrada' o 'salida')
            tipo_usuario, -- Tipo de usuario ('empleado' o 'visitante')
            COUNT(*) AS count -- Contar el número de registros para cada grupo
        FROM
            accesos -- Desde la tabla de accesos
        WHERE
            DATE(fecha) BETWEEN ? AND ? -- Filtrar registros donde la fecha esté dentro del rango especificado
        GROUP BY
            DATE(fecha), tipo, tipo_usuario -- Agrupar los resultados por fecha, tipo de acceso y tipo de usuario
        ORDER BY
            access_date, tipo, tipo_usuario; -- Ordenar los resultados para facilitar el procesamiento en el cliente
    `;

    // Ejecutar la consulta a la base de datos
    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta de estadísticas de accesos:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas de accesos desde la base de datos.' });
        }

        console.log(`Consulta de estadísticas exitosa. ${results.length} filas devueltas.`);
        // Enviar los resultados (un array de objetos, cada uno con access_date, tipo, tipo_usuario, count) como respuesta JSON
        res.status(200).json(results);
    });
});

// --- Rutas GET para Reportes Periódicos (¡AHORA GENERAN ARCHIVOS EXCEL!) ---
// Usadas por admins.js para descargar reportes detallados en formato .xlsx.

// Ruta API GET /api/reportes/diario
// Genera y descarga un archivo Excel con todos los accesos registrados en el día actual.
app.get('/api/reportes/diario', (req, res) => {
    console.log('Recibida petición GET para generar reporte diario (Excel).');

    // Consulta SQL para obtener detalles de accesos del día actual.
    // Incluye LEFT JOINs para traer información relevante de empleados, peticion_visitantes, área, puesto y departamento.
    // CORREGIDO: Usando 'peticion_visitantes' en lugar de 'visitantes' y 'v.Id_peticion' en el JOIN.
    const query = `
        SELECT
            a.Id_acceso,
            a.fecha,
            a.hora,
            a.tipo,
            a.tipo_usuario,
            -- Obtener nombre del usuario (empleado o visitante de peticion_visitantes)
            COALESCE(e.nombre, v.nombre) AS nombre_usuario,
            -- Obtener apellido del usuario (empleado o visitante de peticion_visitantes)
            COALESCE(e.apellido, v.apellido) AS apellido_usuario, -- Incluir apellido del visitante si existe
            -- Cédula solo para empleados (visitantes no tienen en esta estructura)
            COALESCE(e.cedula, '') AS cedula_usuario,
            ar.nombre AS area, -- Nombre del área del acceso
            p.nombre AS puesto, -- Nombre del puesto (solo para empleados)
            d.nombre AS departamento -- Nombre del departamento (solo para empleados)
        FROM
            accesos a
        LEFT JOIN -- LEFT JOIN para empleados: si tipo_usuario es 'empleado', unir con la tabla 'empleados'
            empleados e ON a.Id_empleado = e.Id_empleados AND a.tipo_usuario = 'empleado'
        LEFT JOIN -- LEFT JOIN para visitantes: si tipo_usuario es 'visitante', unir con la tabla 'peticion_visitantes'.
                 -- ASUME que accesos.Id_empleado guarda el Id_peticion de peticion_visitantes para visitantes.
            peticion_visitantes v ON a.Id_empleado = v.Id_peticion AND a.tipo_usuario = 'visitante'
         LEFT JOIN -- LEFT JOIN con la tabla 'area' usando Id_area del acceso
             area ar ON a.Id_area = ar.Id_area
        LEFT JOIN -- LEFT JOIN con la tabla 'puesto' (relacionada vía empleados). Será NULL para visitantes.
             puesto p ON e.Id_puesto = p.ID_puesto
        LEFT JOIN -- LEFT JOIN con la tabla 'departamentos' (relacionada vía puesto). Será NULL para visitantes.
             departamentos d ON p.ID_departamento = d.Id_departamento
        WHERE
            DATE(a.fecha) = CURDATE() -- Filtrar registros donde la fecha sea la de hoy del servidor
        ORDER BY
            a.fecha, a.hora; -- Ordenar cronológicamente los accesos del día
    `;

    db.query(query, async (err, results) => { // Usar async aquí para poder usar await con workbook.xlsx.writeBuffer()
        if (err) {
            console.error('Error al ejecutar la consulta de reporte diario:', err);
            // Enviar respuesta de error al frontend
            return res.status(500).json({ error: 'Error al obtener reporte diario desde la base de datos.' });
        }

        console.log(`Consulta de reporte diario exitosa. ${results.length} filas devueltas. Generando Excel...`);

        // --- Generar archivo Excel ---
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema Control Accesos'; // Opcional: Metadatos
        workbook.lastModifiedBy = 'Admin'; // Opcional
        workbook.created = new Date(); // Opcional

        const worksheet = workbook.addWorksheet('Reporte Diario'); // Nombre de la hoja

        // Definir las columnas del archivo Excel (encabezados y la clave del dato en los objetos de resultado)
        worksheet.columns = [
            { header: 'ID Acceso', key: 'Id_acceso', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Hora', key: 'hora', width: 10 },
            { header: 'Tipo', key: 'tipo', width: 10 },
            { header: 'Tipo Usuario', key: 'tipo_usuario', width: 15 },
            { header: 'Nombre', key: 'nombre_usuario', width: 25 },
            { header: 'Apellido', key: 'apellido_usuario', width: 25 },
            { header: 'Cédula', key: 'cedula_usuario', width: 15 },
            { header: 'Área', key: 'area', width: 20 },
            { header: 'Puesto', key: 'puesto', width: 20 },
            { header: 'Departamento', key: 'departamento', width: 20 }
        ];

        // Añadir los datos de los resultados de la consulta a las filas de la hoja de cálculo
        results.forEach(access => {
             // Formatear fecha y hora si es necesario, ya que mysql2 podría devolver objetos Date o formatos no deseados directamente
             const rowData = { ...access }; // Copiar el objeto para no modificar el original

             if (rowData.fecha instanceof Date) {
                 rowData.fecha = moment(rowData.fecha).format('YYYY-MM-DD');
             }
             // mysql2 puede devolver TIME como objeto { hours, minutes, seconds }
             if (typeof rowData.hora === 'object' && rowData.hora !== null && 'hours' in rowData.hora) {
                 rowData.hora = moment().set({ hour: rowData.hora.hours, minute: rowData.hora.minutes, second: rowData.hora.seconds, millisecond: 0 }).format('HH:mm:ss');
             } else if (rowData.hora instanceof Date) { // A veces TIME puede venir como Date
                  rowData.hora = moment(rowData.hora).format('HH:mm:ss');
             }
             // COALESCE en la consulta ya maneja NULLs a '', pero si hay otros campos, podrías checar aquí
             // rowData.someField = rowData.someField || ''; // Ejemplo

            worksheet.addRow(rowData); // Añadir la fila con los datos (exceljs mapea por 'key')
        });

        // Configurar los encabezados de la respuesta HTTP para indicarle al navegador que es un archivo para descargar
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const filename = `Reporte_Diario_Accesos_${moment().format('YYYYMMDD_HHmmss')}.xlsx`; // Nombre del archivo con timestamp
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); // Indica al navegador que descargue el archivo

        // Escribir el libro de trabajo en un buffer y enviarlo en la respuesta
        try {
            const buffer = await workbook.xlsx.writeBuffer(); // Generar el archivo en memoria
            res.send(buffer); // Enviar el buffer como respuesta
             console.log(`Reporte diario "${filename}" generado y enviado.`);
        } catch (excelErr) {
            console.error('Error al generar el archivo Excel del reporte diario:', excelErr);
            // Si falla la generación del archivo, enviar un error 500 al frontend
            res.status(500).json({ error: 'Error al generar el archivo de reporte diario.' });
        }
    });
});

// Ruta API GET /api/reportes/semanal
// Genera y descarga un archivo Excel con todos los accesos registrados en los últimos 7 días.
app.get('/api/reportes/semanal', (req, res) => {
     console.log('Recibida petición GET para generar reporte semanal (Excel).');

    // Consulta SQL para obtener detalles de accesos de los últimos 7 días.
    // Usa la misma estructura JOIN que el reporte diario, solo cambia la condición WHERE.
    // CORREGIDO: Usando 'peticion_visitantes' y 'v.Id_peticion' en el JOIN.
    const query = `
        SELECT
            a.Id_acceso,
            a.fecha,
            a.hora,
            a.tipo,
            a.tipo_usuario,
            -- Obtener nombre del usuario (empleado o visitante de peticion_visitantes)
            COALESCE(e.nombre, v.nombre) AS nombre_usuario,
            -- Obtener apellido del usuario (empleado o visitante de peticion_visitantes)
            COALESCE(e.apellido, v.apellido) AS apellido_usuario, -- Incluir apellido del visitante si existe
            -- Cédula solo para empleados (visitantes no tienen en esta estructura)
            COALESCE(e.cedula, '') AS cedula_usuario,
            ar.nombre AS area, -- Nombre del área del acceso
            p.nombre AS puesto, -- Nombre del puesto (solo para empleados)
            d.nombre AS departamento -- Nombre del departamento (solo para empleados)
        FROM
            accesos a
        LEFT JOIN -- LEFT JOIN para empleados
            empleados e ON a.Id_empleado = e.Id_empleados AND a.tipo_usuario = 'empleado'
        LEFT JOIN -- LEFT JOIN para visitantes: Asume que accesos.Id_empleado guarda el Id_peticion
            peticion_visitantes v ON a.Id_empleado = v.Id_peticion AND a.tipo_usuario = 'visitante'
         LEFT JOIN -- LEFT JOIN con la tabla 'area'
             area ar ON a.Id_area = ar.Id_area
        LEFT JOIN -- LEFT JOIN con la tabla 'puesto'
             puesto p ON e.Id_puesto = p.ID_puesto
        LEFT JOIN -- LEFT JOIN con la tabla 'departamentos'
             departamentos d ON p.ID_departamento = d.Id_departamento
        WHERE
            DATE(a.fecha) BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE() -- Filtrar los últimos 7 días (hoy incluido)
        ORDER BY
            a.fecha, a.hora; -- Ordenar cronológicamente
    `;

    db.query(query, async (err, results) => { // Usar async aquí
        if (err) {
            console.error('Error al ejecutar la consulta de reporte semanal:', err);
            // Enviar respuesta de error al frontend
            return res.status(500).json({ error: 'Error al obtener reporte semanal desde la base de datos.' });
        }
        console.log(`Consulta de reporte semanal exitosa. ${results.length} filas devueltas. Generando Excel...`);

        // --- Generar archivo Excel (similar al reporte diario) ---
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema Control Accesos';
        workbook.lastModifiedBy = 'Admin';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Reporte Semanal'); // Nombre de la hoja

        // Definir las columnas del archivo Excel
         worksheet.columns = [
            { header: 'ID Acceso', key: 'Id_acceso', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Hora', key: 'hora', width: 10 },
            { header: 'Tipo', key: 'tipo', width: 10 },
            { header: 'Tipo Usuario', key: 'tipo_usuario', width: 15 },
            { header: 'Nombre', key: 'nombre_usuario', width: 25 },
            { header: 'Apellido', key: 'apellido_usuario', width: 25 },
            { header: 'Cédula', key: 'cedula_usuario', width: 15 },
            { header: 'Área', key: 'area', width: 20 },
            { header: 'Puesto', key: 'puesto', width: 20 },
            { header: 'Departamento', key: 'departamento', width: 20 }
        ];

        // Añadir los datos de los resultados
        results.forEach(access => {
             const rowData = { ...access };
             if (rowData.fecha instanceof Date) {
                 rowData.fecha = moment(rowData.fecha).format('YYYY-MM-DD');
             }
             if (typeof rowData.hora === 'object' && rowData.hora !== null && 'hours' in rowData.hora) {
                 rowData.hora = moment().set({ hour: rowData.hora.hours, minute: rowData.hora.minutes, second: rowData.hora.seconds, millisecond: 0 }).format('HH:mm:ss');
             } else if (rowData.hora instanceof Date) {
                  rowData.hora = moment(rowData.hora).format('HH:mm:ss');
             }
            worksheet.addRow(rowData);
        });

        // Configurar encabezados de respuesta para descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const filename = `Reporte_Semanal_Accesos_${moment().format('YYYYMMDD_HHmmss')}.xlsx`; // Nombre del archivo
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); // Indica descarga

        // Escribir buffer y enviar
        try {
            const buffer = await workbook.xlsx.writeBuffer();
            res.send(buffer);
            console.log(`Reporte semanal "${filename}" generado y enviado.`);
        } catch (excelErr) {
            console.error('Error al generar el archivo Excel del reporte semanal:', excelErr);
            res.status(500).json({ error: 'Error al generar el archivo de reporte semanal.' });
        }
    });
});


// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Cerrar la conexión a la base de datos cuando el proceso del servidor termine (opcional pero recomendado)
process.on('SIGINT', () => {
    console.log('Cerrando conexión a la base de datos...');
    db.end(err => {
        if (err) {
            console.error('Error al cerrar la conexión de la base de datos:', err);
        } else {
            console.log('Conexión a la base de datos cerrada.');
        }
        process.exit(); // Terminar el proceso del servidor
    });
});