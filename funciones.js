// Configurar el formulario de inicio de sesión
export function login() {
    const loginForm = document.getElementById("loginForm"); // Asegúrate de que exista en `views/login.html`

    if (loginForm) {
        // Manejar el envío del formulario de login
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Validación simple
            if (username === "admin" && password === "1234") {
                sessionStorage.setItem("userLoggedIn", username);
                alert("Login exitoso");
                loadMainPage(); // Cambiar a la página principal
            } else {
                alert("Usuario o contraseña incorrectos.");
            }
        });
    } else {
        console.error("Formulario de login no encontrado. Verifica el archivo login.html");
    }
}