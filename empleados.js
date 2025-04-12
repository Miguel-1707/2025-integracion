const empleados = {
    "123": {nombre:"Miguel Gonzalez"},
    "456": {nombre:"Norma De Anda"}
};

document.getElementById("form-empleado").addEventListener("submit", function() {
    var codigo = document.getElementById("codigo-empleado").value;

    if (empleados[codigo]) {
        document.getElementById("bienvenida-empleado").style.display = "block";
        document.getElementById("empleado-form-container").style.display = "none";

        document.getElementById("nombre-empleado").textContent = empleados[codigo].nombre;
    } else {
        alert("Código de empleado incorrecto. Por favor, intentalo nuevamente");
    }
});