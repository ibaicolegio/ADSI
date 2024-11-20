import {cargarLikes, login, buscar} from "./js/funciones.js";
import {openIndexedDB, insertarEnIndexedDB} from "./js/bd.js";
// Objeto para almacenar las páginas cargadas
const cache = {};

document.addEventListener("DOMContentLoaded", async function () {


    // Verificar si el usuario está autenticado
    const isAuthenticated = sessionStorage.getItem("userLoggedIn");

    if (!isAuthenticated) {
        // Mostrar el login con su propio header
        loadPaginaPrincipal();
    } else {
        // Mostrar el contenido principal con el header general
        loadPaginaUsuario();
    }

    await loadAndStoreData();

});

async function loadAndStoreData() {
    try {
         // Abrir la base de datos
        const db = await openIndexedDB();

        // Cargar y almacenar usuarios
        const usuariosResponse = await fetch('json/usuarios.json');
        if (!usuariosResponse.ok) {
            throw new Error(`Error al cargar usuarios.json: ${usuariosResponse.status}`);
        }
        const usuariosData = await usuariosResponse.json();
        await insertarEnIndexedDB(db, 'usuarios', usuariosData);

        // Cargar y almacenar meGusta
        const meGustaResponse = await fetch('json/meGusta.json');
        if (!meGustaResponse.ok) {
            throw new Error(`Error al cargar meGusta.json: ${meGustaResponse.status}`);
        }
        const meGustaData = await meGustaResponse.json();
        await insertarEnIndexedDB(db, 'meGusta', meGustaData);

        // Cargar y almacenar aficiones
        const aficionesResponse = await fetch('json/aficiones.json');
        if (!aficionesResponse.ok) {
            throw new Error(`Error al cargar aficiones.json: ${aficionesResponse.status}`);
        }
        const aficionesData = await aficionesResponse.json();
        await insertarEnIndexedDB(db, 'aficiones', aficionesData);

        // Cargar y almacenar usuAfi
        const usuAfiResponse = await fetch('json/usuAfi.json');
        if (!usuAfiResponse.ok) {
            throw new Error(`Error al cargar usuAfi.json: ${usuAfiResponse.status}`);
        }
        const usuAfiData = await usuAfiResponse.json();
        await insertarEnIndexedDB(db, 'usuAfi', usuAfiData);

        console.log('Todos los datos se almacenaron en IndexedDB correctamente.');
        
        
        // Opcional: Mostrar los datos en el DOM
        const output = document.getElementById('output');
        if (output) {
            output.textContent = `Usuarios cargados:\n${JSON.stringify(usuariosData, null, 2)}\n\nObjetos cargados:\n${JSON.stringify(aficionesData, null, 2)}`;
        }
    } catch (error) {
        console.error('Error al cargar datos:', error.message);

        // Mostrar error en el DOM si existe el contenedor
        const output = document.getElementById('output');
        if (output) {
            output.textContent = `Error: ${error.message}`;
        }
    }
}


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
                                    if (view === "views/login.html") {
                                        console.log(view);
                                        login();
                                    }
                                    if (view === "views/busqueda.html") {
                                        console.log(view);
                                        buscar();
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
                const welcomeMessage = document.getElementById("welcomeMessage");
                const loggedInUser = JSON.parse(sessionStorage.getItem("userLoggedIn"));
                if (loggedInUser) {
                    welcomeMessage.textContent = `Hola, ${loggedInUser.nombre}`;
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
                                if (view === "views/verLikes.html") {
                                    console.log(view);
                                    cargarLikes();
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
                                                cargarLikes();
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

