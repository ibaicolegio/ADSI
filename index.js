// Objeto para almacenar las páginas cargadas
const cache = {};

document.addEventListener("DOMContentLoaded", function () {


    // Verificar si el usuario está autenticado
    const isAuthenticated = sessionStorage.getItem("userLoggedIn");

    if (!isAuthenticated) {
        // Mostrar el login con su propio header
        loadPaginaPrincipal();
    } else {
        // Mostrar el contenido principal con el header general
        loadPaginaUsuario();
    }
});

// Función para cargar la página de login con su propio header
function loadPaginaPrincipal() {
    Promise.all([
        loadHTML("views/login-header.html", "header"),
        loadHTML("views/busqueda.html", "main"),
        loadHTML("views/footer.html", "footer")
    ]).then(() => {
        // Este bloque solo se ejecuta después de que todo se ha cargado
        const loginLinks = document.querySelectorAll("header .nav-link");
        const content = document.getElementById("main");
        buscar();

        // Manejar navegación en el header de login
        loginLinks.forEach((link) => {
            link.addEventListener("click", function (event) {
                event.preventDefault();

                // Gestionar clases de énfasis
                loginLinks.forEach((l) => l.classList.remove("link-body-emphasis"));
                loginLinks.forEach((l) => l.classList.add("link-secondary"));

                link.classList.add("link-body-emphasis");
                link.classList.remove("link-secondary");

                const view = link.getAttribute("data-view");

                if (view) {
                    if (cache[view]) {
                        content.innerHTML = cache[view];
                    } else {
                        fetch(view)
                                .then((response) => {
                                    if (!response.ok)
                                        throw new Error("Página no encontrada.");
                                    return response.text();
                                })
                                .then((html) => {
                                    cache[view] = html;
                                    content.innerHTML = html;
                                    if(view==="views/login.html"){
                                        console.log(view);
                                        login();
                                        
                                    }
                                    
                                })
                                .catch((error) => {
                                    content.innerHTML = `<p>Error: ${error.message}</p>`;
                                });
                    }
                }
            });
        });
    });
}
// Función para cargar la página principal con el header general
function loadPaginaUsuario() {
    Promise.all([
        loadHTML("views/header.html", "header"),
        loadHTML("views/inicio.html", "main"),
        loadHTML("views/footer.html", "footer"),
    ])
            .then(() => {
                const links = document.querySelectorAll("header .nav-link");
                const content = document.getElementById("main");

                // Mostrar saludo con el nombre del usuario
                const welcomeMessage = document.getElementById("welcomeMessage");
                const loggedInUser = sessionStorage.getItem("userLoggedIn");
                if (loggedInUser) {
                    welcomeMessage.textContent = `Hola, ${loggedInUser}`;
                }

                // Agregar funcionalidad al botón de logout
                const logoutButton = document.getElementById("logoutButton");
                if (logoutButton) {
                    logoutButton.addEventListener("click", function () {
                        sessionStorage.removeItem("userLoggedIn"); // Eliminar el usuario de sessionStorage
                        alert("Has cerrado sesión.");
                        location.reload(); // Recargar para redirigir al login
                    });
                }

                // Manejar navegación entre páginas
                links.forEach((link) => {
                    link.addEventListener("click", function (event) {
                        event.preventDefault();

                        // Gestionar clases de énfasis
                        links.forEach((l) => l.classList.remove("link-body-emphasis"));
                        links.forEach((l) => l.classList.add("link-secondary"));

                        link.classList.add("link-body-emphasis");
                        link.classList.remove("link-secondary");

                        const view = link.getAttribute("data-view");

                        if (view) {
                            if (cache[view]) {
                                content.innerHTML = cache[view];
                            } else {
                                fetch(view)
                                        .then((response) => {
                                            if (!response.ok)
                                                throw new Error("Página no encontrada.");
                                            return response.text();
                                        })
                                        .then((html) => {
                                            cache[view] = html;
                                            content.innerHTML = html;

                                        })
                                        .catch((error) => {
                                            content.innerHTML = `<p>Error: ${error.message}</p>`;
                                        });
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error("Error al cargar el header, main o footer:", error.message);
            });
}

// Función para cargar un archivo HTML en un elemento
function loadHTML(file, elementId) {

    return fetch(file)
            .then((response) => {
                if (!response.ok)
                    throw new Error(`Failed to load ${file}`);
                return response.text();
            })
            .then((html) => {
                document.getElementById(elementId).innerHTML = html;
                // Ejecutar una función específica si el archivo cargado es hola.html
                if (file === "views/login.html") {
                    console.log("hola");
                    setupLoginHandlers(); // Llamar a la función específica
                }
                return Promise.resolve(); // Confirmar que se ha cargado
            })
            .catch((error) => {
                console.error(`Error loading ${file}: ${error.message}`);
                return Promise.reject(error);
            });
}

// Configurar el formulario de inicio de sesión
function login() {
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
                // Recargar la página
                location.reload();
            } else {
                alert("Usuario o contraseña incorrectos.");
            }
        });
    } else {
        console.error("Formulario de login no encontrado. Verifica el archivo login.html");
    }
}

 function buscar(){
    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Evitar la recarga de la página al enviar el formulario

            // Obtener los valores seleccionados
            const gender = document.getElementById("gender").value;
            const minAge = document.getElementById("minAge").value;
            const maxAge = document.getElementById("maxAge").value;
            const city = document.getElementById("city").value;

            // Filtrar o realizar búsqueda con estos valores
            const searchResults = performSearch( minAge, maxAge, city);

            // Mostrar los resultados en el contenedor principal
            const content = document.getElementById("main");
            content.innerHTML = searchResults;
        });
        }
    };
    
    function performSearch(minAge, maxAge, city) {
    // Aquí puedes realizar tu búsqueda o filtros basados en los datos.
    return `<h2>Resultados de la búsqueda</h2>
       
            <p>Edad mínima: ${minAge}</p>
            <p>Edad máxima: ${maxAge}</p>
            <p>Ciudad: ${city}</p>`;
}
