// admins.js
// Script para la página de administración (admins.html)
// Contiene la lógica para:
// - Cargar y mostrar estadísticas de accesos (Sección 1)
// - Generar y descargar reportes periódicos (Sección 2 - Excel)
// - Espacio para futuras secciones (Gestión de Empleados, Solicitudes de Visitas)

document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM completamente cargado. Iniciando scripts para admins...");

    // --- Código para Estadísticas de Accesos (Sección 1) ---

    // Función asíncrona para obtener datos de estadísticas desde el servidor y dibujar el gráfico
    async function loadAccessStats() {
        // Obtener referencias al contenedor del gráfico y al elemento canvas
        const chartContainer = document.querySelector('.chart-container');
        const chartCanvas = document.getElementById('accessStatsChart'); // Asegúrate de que exista en tu HTML

        // Ocultar el párrafo placeholder "[Grafica de entradas/salidas]" si aún existe
        const existingParagraph = chartContainer ? chartContainer.querySelector('p') : null;
         if (existingParagraph) {
            existingParagraph.style.display = 'none';
         }

        // Si el elemento canvas para el gráfico no existe, mostrar error y salir
        if (!chartCanvas) {
            console.error("Elemento canvas con ID 'accessStatsChart' no encontrado en el HTML. No se puede dibujar el gráfico.");
            if (chartContainer) {
                 chartContainer.innerHTML = '<p style="color: red;">Error: Elemento para el gráfico no encontrado en la página.</p>';
            }
            return;
        }

        try {
            // Hacer la petición fetch a la API de estadísticas (server.js)
            const response = await fetch('http://localhost:3000/api/stats/daily-accesses');

            // Verificar si la respuesta HTTP fue exitosa
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Estado: ${response.status}, Mensaje: ${errorText}`);
            }

            // Parsear la respuesta como JSON
            const data = await response.json();

            console.log('Datos de estadísticas recibidos:', data);

            // Procesar los datos para Chart.js (resumen entradas/salidas por día)
            const dailyDataSummary = {};
            data.forEach(item => {
                const date = item.access_date;
                if (!dailyDataSummary[date]) {
                    dailyDataSummary[date] = { entrada: 0, salida: 0 };
                }
                if (item.tipo === 'entrada') { dailyDataSummary[date].entrada += item.count; }
                else if (item.tipo === 'salida') { dailyDataSummary[date].salida += item.count; }
            });

            // Preparar datos para Chart.js
            const labels = Object.keys(dailyDataSummary).sort();
            const entries = labels.map(date => dailyDataSummary[date].entrada);
            const exits = labels.map(date => dailyDataSummary[date].salida);

            const ctx = chartCanvas.getContext('2d');

            // Destruir gráfico existente si lo hay para actualizar
            if (window.accessStatsChartInstance) { window.accessStatsChartInstance.destroy(); }

            // Crear el nuevo gráfico
            window.accessStatsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels, datasets: [ { label: 'Entradas Totales', data: entries, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }, { label: 'Salidas Totales', data: exits, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 } ] },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Número de Accesos' } }, x: { title: { display: true, text: 'Fecha' } } }, plugins: { title: { display: true, text: 'Total de Entradas y Salidas por Día' }, tooltip: { mode: 'index', intersect: false } } }
            });

        } catch (error) {
            console.error('Error al cargar o dibujar las estadísticas:', error);
            if (chartContainer) {
                 chartContainer.innerHTML = '<p style="color: red;">Error al cargar las estadísticas.</p>';
            }
        }
    }

    // Llamar a la función para cargar las estadísticas al cargar la página
    loadAccessStats();

    // --- Fin Código para Estadísticas ---


    // --- Código para Reportes Periódicos (Sección 2 - Generación Excel) ---

    // Obtener referencias a los botones de reporte y al área de mensajes
    const btnReporteDiario = document.getElementById('btn-reporte-diario');
    const btnReporteSemanal = document.getElementById('btn-reporte-semanal');
    const reportResultsDiv = document.getElementById('report-results'); // Este div mostrará mensajes de estado/error

    // La función displayReport() YA NO ES NECESARIA aquí.


    // --- Añadir Listeners a los botones de reporte ---

    // Listener para el clic en el botón "Generar Reporte diario"
    if (btnReporteDiario) {
        btnReporteDiario.addEventListener('click', async () => {
            console.log('Clic: Generar Reporte Diario (Excel)...');
            if (reportResultsDiv) {
                 reportResultsDiv.innerHTML = '<p>Generando reporte diario...</p>';
            }

            try {
                // Hacer la petición fetch a la ruta API del reporte diario
                const response = await fetch('http://localhost:3000/api/reportes/diario');

                // Verificar si la respuesta HTTP fue exitosa
                if (response.ok) {
                    console.log('Petición de reporte diario exitosa. Procesando descarga...');
                    if (reportResultsDiv) {
                         reportResultsDiv.innerHTML = '<p>Preparando descarga del archivo...</p>';
                     }

                    // *** Código para forzar la descarga del archivo Blob ***

                    // 1. Intentar obtener el nombre del archivo del encabezado Content-Disposition
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = `reporte_diario_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`; // Nombre por defecto

                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                        if (filenameMatch && filenameMatch[1]) {
                            filename = filenameMatch[1]; // Usar el nombre del servidor si está en el encabezado
                        }
                    }
                     console.log(`Nombre de archivo detectado: ${filename}`);

                    // 2. Obtener el cuerpo de la respuesta como un Blob (el contenido binario del archivo)
                    const blob = await response.blob();

                    // 3. Crear una URL temporal localmente para el Blob
                    const url = window.URL.createObjectURL(blob);

                    // 4. Crear un elemento de ancla (<a>) oculto dinámicamente
                    const a = document.createElement('a');
                    a.style.display = 'none'; // Ocultar el enlace
                    a.href = url; // Establecer la URL del Blob como destino del enlace
                    a.download = filename; // Establecer el nombre del archivo para la descarga forzada

                    // 5. Añadir el enlace al cuerpo del documento y hacer clic programáticamente
                    document.body.appendChild(a);
                    a.click(); // Simular un clic en el enlace para iniciar la descarga

                    // 6. Limpiar: remover el enlace del DOM y liberar la URL del Blob
                    setTimeout(() => {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        console.log('Limpieza de URL Blob realizada.');
                    }, 100); // Pequeño retraso

                    console.log(`Descarga iniciada para el archivo: "${filename}".`);
                    if (reportResultsDiv) {
                        reportResultsDiv.innerHTML = `<p style="color: green;">Reporte "${filename}" generado. Revisa tus descargas.</p>`;
                    }

                    // *** Fin del procesamiento para forzar la descarga ***


                } else {
                     // Si la respuesta HTTP no fue exitosa (ej: 404, 500)
                     console.error(`Petición de reporte diario fallida: Estado HTTP ${response.status}.`);
                     // Leer el cuerpo de la respuesta (asumimos que es JSON con error del servidor)
                     const errorData = await response.json();
                     const errorMessageText = errorData.error || `Error desconocido del servidor (Estado ${response.status}).`;
                     // Lanzar un nuevo error para ser capturado por el bloque catch
                     throw new Error(`Error HTTP! Estado: ${response.status}, Mensaje: ${errorMessageText}`);
                }

            } catch (error) {
                // *** Manejo de errores generales (fallos de red, errores lanzados) ***
                console.error('Error al generar reporte diario:', error);
                 if (reportResultsDiv) {
                    reportResultsDiv.innerHTML = `<p style="color: red;">Error al generar el reporte diario: ${error.message}</p>`;
                 }
            }
        });
    } else {
        console.warn("Elemento con ID 'btn-reporte-diario' no encontrado. El listener no fue adjuntado.");
    }

     // Listener para el clic en el botón "Generar Reporte Semanal"
    if (btnReporteSemanal) {
        btnReporteSemanal.addEventListener('click', async () => {
            console.log('Clic: Generar Reporte Semanal (Excel)...');
             if (reportResultsDiv) {
                 reportResultsDiv.innerHTML = '<p>Generando reporte semanal...</p>';
             }

            try {
                const response = await fetch('http://localhost:3000/api/reportes/semanal');

                if (response.ok) {
                    console.log('Petición de reporte semanal exitosa. Procesando descarga...');
                     if (reportResultsDiv) {
                         reportResultsDiv.innerHTML = '<p>Preparando descarga del archivo...</p>';
                     }

                    // *** Código para forzar la descarga del archivo Blob (similar al diario) ***

                    const contentDisposition = response.headers.get('Content-Disposition');
                     let filename = `reporte_semanal_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`; // Nombre por defecto

                    if (contentDisposition) {
                         const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                         if (filenameMatch && filenameMatch[1]) {
                             filename = filenameMatch[1];
                         }
                    }
                     console.log(`Nombre de archivo detectado: ${filename}`);


                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = filename;

                    document.body.appendChild(a);
                    a.click();

                    setTimeout(() => {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        console.log('Limpieza de URL Blob realizada.');
                    }, 100);

                    console.log(`Descarga iniciada para el archivo: "${filename}".`);
                     if (reportResultsDiv) {
                         reportResultsDiv.innerHTML = `<p style="color: green;">Reporte "${filename}" generado. Revisa tus descargas.</p>`;
                     }

                    // *** Fin del procesamiento para forzar la descarga ***

                } else {
                     console.error(`Petición de reporte semanal fallida: Estado HTTP ${response.status}.`);
                     const errorData = await response.json();
                     const errorMessageText = errorData.error || `Error desconocido del servidor (Estado ${response.status}).`;
                     throw new Error(`Error HTTP! Estado: ${response.status}, Mensaje: ${errorMessageText}`);
                }

            } catch (error) {
                console.error('Error al generar reporte semanal:', error);
                 if (reportResultsDiv) {
                    reportResultsDiv.innerHTML = `<p style="color: red;">Error al generar el reporte semanal: ${error.message}</p>`;
                 }
            }
        });
    } else {
         console.warn("Elemento con ID 'btn-reporte-semanal' no encontrado. El listener no fue adjuntado.");
    }



}); // Fin del listener principal DOMContentLoaded
