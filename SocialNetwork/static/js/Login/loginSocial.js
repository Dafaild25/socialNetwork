// Función para obtener el CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const iconoVerContraseña = document.querySelector("#showPassword");
const inputContraseña = document.querySelector("#password");


iconoVerContraseña.addEventListener("click", function () {
    // Alternar entre el tipo de campo 'password' y 'text'
    const type = inputContraseña.getAttribute("type") === "password" ? "text" : "password";
    inputContraseña.setAttribute("type", type);
    
    // Alternar el icono de ojo
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});


//Cerrar modal erro autenticacion
function closeAuthenticationModal(){
    $('#errorModalAutenticacion').modal('hide'); // Usa jQuery para cerrar el modal
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});