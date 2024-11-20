import {cargarLikes, login, buscar, cargarFotoYMensajeBienvenida} from "./js/funciones.js";
import {cargarYAlmacenarDatos, obtenerUsuariosDesdeIndexedDB, obtenerLikesDesdeIndexedDB} from "./js/bd.js";
// Objeto para almacenar las páginas cargadas
const cache = {};

document.addEventListener("DOMContentLoaded", async function () {


    // Verificar si el usuario está autenticado
    const isAuthenticated = sessionStorage.getItem("userLoggedIn");

    if (!isAuthenticated) {
        // Mostrar el login con su propio header
        loadPaginaPrincipal();
        buscar(obtenerUsuariosDesdeIndexedDB);
    } else {
        // Mostrar el contenido principal con el header general
        loadPaginaUsuario();
    }

    cargarYAlmacenarDatos();

});

// Función para cargar la página de login con su propio header
function loadPaginaPrincipal() {
    Promise.all([
        loadHTML("views/login-header.html", "header"),
        loadHTML("views/inicio.html", "main"),
        loadHTML("views/footer.html", "footer")
    ]).then(() => {
        // Este bloque solo se ejecuta después de que todo se ha cargado
        const loginLinks = document.querySelectorAll("header .nav-link");
        const content = document.getElementById("main");
        
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
                        if (view === "views/busqueda.html") {
                            console.log(view);
                            buscar(obtenerUsuariosDesdeIndexedDB);
                        }
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
                                    if (view === "views/login.html") {
                                        console.log(view);
                                        login(obtenerUsuariosDesdeIndexedDB);
                                    }
                                    if (view === "views/busqueda.html") {
                                        console.log(view);
                                        buscar(obtenerUsuariosDesdeIndexedDB);
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
        loadHTML("views/footer.html", "footer")
    ])
            .then(() => {
                const links = document.querySelectorAll("header .nav-link");
                const content = document.getElementById("main");

                // Mostrar saludo con el nombre del usuario
                /*const welcomeMessage = document.getElementById("welcomeMessage");
                const loggedInUser = JSON.parse(sessionStorage.getItem("userLoggedIn"));
                if (loggedInUser) {
                    welcomeMessage.textContent = `Hola, ${loggedInUser.nombre}`;
                }*/
                cargarFotoYMensajeBienvenida(obtenerUsuariosDesdeIndexedDB);

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
                                if (view === "views/verLikes.html") {
                                    console.log(view);
                                    cargarLikes(obtenerLikesDesdeIndexedDB);
                                }
                                if (view === "views/busqueda.html") {
                                        console.log(view);
                                        buscar(obtenerUsuariosDesdeIndexedDB);
                                    }
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
                                            if (view === "views/verLikes.html") {
                                                console.log(view);
                                                cargarLikes(obtenerLikesDesdeIndexedDB);
                                            }
                                            if (view === "views/busqueda.html") {
                                                console.log(view);
                                                buscar(obtenerUsuariosDesdeIndexedDB);
                                            }
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

