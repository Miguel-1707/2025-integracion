const usuariovalidado = "admin";
const contraseñavalidada = "1234";

function validar(){
    const usuarioingresado = document.getElementById("username").value;
    const contraseñaingresada = document.getElementById("password").value;
    const errormsg = document.getElementById("mensaje_Error");

    if(usuarioingresado === usuariovalidado && contraseñaingresada === contraseñavalidada){
        window.location.href = "principal.html"; // Redirige a la página principal
    }else{
        errormsg.style.display = "block";
    }
}

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    validar();
});