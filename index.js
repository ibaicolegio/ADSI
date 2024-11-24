import {cargarLikes, loadUserProfile, login, buscar, cargarFotoYMensajeBienvenida, cargarAficiones, añadirAficion, eliminarAficiones, initMap} from "./js/funciones.js";
import {openIndexedDB, añadirAficionesSeleccionadas, eliminarAficionesSeleccionadas, cargarYAlmacenarDatos, obtenerUsuariosDesdeIndexedDB, obtenerLikesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, obtenerAficionesDesdeIndexedDB} from "./js/bd.js";
// Objeto para almacenar las páginas cargadas
const cache = {};

document.addEventListener("DOMContentLoaded", async function () {


    // Verificar si el usuario está autenticado
    const isAuthenticated = sessionStorage.getItem("userLoggedIn");

    if (!isAuthenticated) {
        // Mostrar el login con su propio header
        loadPaginaPrincipal();
        buscar(obtenerUsuariosDesdeIndexedDB, obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB);
    } else {
        // Mostrar el contenido principal con el header general
        loadPaginaUsuario();
    }

    cargarYAlmacenarDatos();

});

// Función para cargar la página de login con su propio header
function loadPaginaPrincipal() {
    Promise.all([
        loadHTML("html/login-header.html", "header"),
        loadHTML("html/inicio.html", "main"),
        loadHTML("html/footer.html", "footer")
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
                        if (view === "html/busqueda.html") {
                            console.log(view);
                            buscar(obtenerUsuariosDesdeIndexedDB, obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, content);
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
                                    if (view === "html/login.html") {
                                        console.log(view);
                                        login(obtenerUsuariosDesdeIndexedDB);
                                    }
                                    if (view === "html/busqueda.html") {
                                        console.log(view);
                                        buscar(obtenerUsuariosDesdeIndexedDB, obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, content, view);
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
        loadHTML("html/header.html", "header"),
        loadHTML("html/inicio.html", "main"),
        loadHTML("html/footer.html", "footer")
    ])
            .then(() => {

                const isAuthenticated = sessionStorage.getItem("userLoggedIn");
                const isSelectedUserEmail = sessionStorage.getItem("selectedUserEmail");
                if (isAuthenticated && isSelectedUserEmail) {
                    fetch("./html/verPerfil.html")
                            .then((response) => {
                                if (!response.ok)
                                    throw new Error("Página no encontrada.");
                                return response.text();
                            })
                            .then((html) => {
                                content.innerHTML = html;
                                loadUserProfile(obtenerUsuariosDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, isSelectedUserEmail);
                            })
                            .catch((error) => {
                                content.innerHTML = `<p>Error: ${error.message}</p>`;
                            });
                }
                const links = document.querySelectorAll("header .nav-link");
                const content = document.getElementById("main");

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
                                if (view === "html/verLikes.html") {
                                    console.log(view);
                                    cargarLikes(obtenerLikesDesdeIndexedDB, obtenerUsuariosDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB);
                                }
                                if (view === "html/busqueda.html") {
                                    console.log(view);
                                    buscar(obtenerUsuariosDesdeIndexedDB, obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, content);
                                }
                                if (view === "html/verAficion.html") {
                                    console.log(view);
                                    cargarAficiones(obtenerAficionesUsuarioDesdeIndexedDB, content);
                                }
                                if (view === "html/añadirAficion.html") {
                                    console.log(view);
                                    añadirAficion(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, añadirAficionesSeleccionadas, openIndexedDB);
                                }
                                if (view === "html/eliminarAficion.html") {
                                    console.log(view);
                                    eliminarAficiones(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, eliminarAficionesSeleccionadas, openIndexedDB);
                                }
                                if (view === "html/geolocalizacion.html") {
                                    console.log(view);
                                    initMap(openIndexedDB, obtenerUsuariosDesdeIndexedDB);
                                }
                                if (view === "html/modificarPerfil.html") {
                                    console.log(view);
                                    modificarPerfil();
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
                                            if (view === "html/verLikes.html") {
                                                console.log(view);
                                                cargarLikes(obtenerLikesDesdeIndexedDB, obtenerUsuariosDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB);
                                            }
                                            if (view === "html/busqueda.html") {
                                                console.log(view);
                                                buscar(obtenerUsuariosDesdeIndexedDB, obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, content);
                                            }
                                            if (view === "html/verAficion.html") {
                                                console.log(view);
                                                cargarAficiones(obtenerAficionesUsuarioDesdeIndexedDB, content);
                                            }
                                            if (view === "html/añadirAficion.html") {
                                                console.log(view);
                                                añadirAficion(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, añadirAficionesSeleccionadas, openIndexedDB);
                                            }
                                            if (view === "html/eliminarAficion.html") {
                                                console.log(view);
                                                eliminarAficiones(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, eliminarAficionesSeleccionadas, openIndexedDB);
                                            }
                                            if (view === "html/geolocalizacion.html") {
                                                console.log(view);
                                                initMap(openIndexedDB, obtenerUsuariosDesdeIndexedDB);
                                            }
                                            if (view === "html/modificarPerfil.html") {
                                                console.log(view);
                                                modificarPerfil();
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
                if (file === "html/login.html") {
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

