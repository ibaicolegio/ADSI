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
        // Cargar el archivo usuarios.json
        const usuariosResponse = await fetch('json/usuarios.json');
        if (!usuariosResponse.ok) {
            throw new Error(`Error al cargar el archivo usuarios.json: ${usuariosResponse.status}`);
        }
        const usuariosData = await usuariosResponse.json();

        // Almacenar usuarios en sessionStorage
        sessionStorage.setItem('usuarios', JSON.stringify(usuariosData));

        // Cargar el archivo meGusta.json
        const meGustaResponse = await fetch('json/meGusta.json');
        if (!meGustaResponse.ok) {
            throw new Error(`Error al cargar el archivo usuarios.json: ${meGustaResponse.status}`);
        }
        const meGustaData = await meGustaResponse.json();

        // Almacenar meGusta en sessionStorage
        sessionStorage.setItem('meGusta', JSON.stringify(meGustaData));

        // Cargar el archivo aficiones.json
        const aficionesResponse = await fetch('json/aficiones.json');
        if (!aficionesResponse.ok) {
            throw new Error(`Error al cargar el archivo objetos.json: ${aficionesResponse.status}`);
        }
        const aficionesData = await aficionesResponse.json();

        // Almacenar objetos en sessionStorage
        sessionStorage.setItem('aficiones', JSON.stringify(aficionesData));
        
        // Cargar el archivo usuAfi.json
        const usuAfiResponse = await fetch('json/usuAfi.json');
        if (!usuAfiResponse.ok) {
            throw new Error(`Error al cargar el archivo usuarios.json: ${usuAfiResponse.status}`);
        }
        const usuAfiData = await usuAfiResponse.json();

        // Almacenar usuAfi en sessionStorage
        sessionStorage.setItem('usuAfi', JSON.stringify(usuAfiData));

        // Mostrar en consola los datos cargados para verificar
        console.log('Usuarios cargados:', usuariosData);
        console.log('aficiones cargados:', aficionesData);

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

// Configurar el formulario de inicio de sesión
function login() {
    const loginForm = document.getElementById("loginForm"); // Asegúrate de que exista en `views/login.html`

    if (loginForm) {
        // Manejar el envío del formulario de login
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Recuperar los usuarios almacenados en sessionStorage
            const users = JSON.parse(sessionStorage.getItem("usuarios"));

            // Comprobar si existe un usuario con el correo y la contraseña
            const user = users.find(u => u.email === username && u.password === password);

            if (user) {
                sessionStorage.setItem("userLoggedIn", JSON.stringify(user));
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

function buscar() {
    // Obtener el formulario de búsqueda y el contenedor de resultados
    const searchForm = document.getElementById("searchForm");
    const searchResultsContainer = document.getElementById("searchResultsContainer");

    // Verificar si el formulario existe
    if (searchForm) {
        // Manejar el evento de envío del formulario
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevenir la recarga de la página

            // Obtener los valores del formulario
            const gender = document.getElementById("gender").value;
            const minAge = parseInt(document.getElementById("minAge").value, 10);
            const maxAge = parseInt(document.getElementById("maxAge").value, 10);
            const city = document.getElementById("city").value;

            // Recuperar la lista de usuarios (simulación de datos en sessionStorage)
            const users = JSON.parse(sessionStorage.getItem("usuarios")) || [];

            // Filtrar los usuarios según los criterios
            const filteredUsers = users.filter(user => {
                return (!gender || user.gender === gender) &&
                       (!isNaN(minAge) && user.age >= minAge) &&
                       (!isNaN(maxAge) && user.age <= maxAge) &&
                       (!city || user.city.toLowerCase() === city.toLowerCase());
            });

            // Limpiar resultados previos
            searchResultsContainer.innerHTML = "";

            // Mostrar los resultados o un mensaje si no hay coincidencias
            if (filteredUsers.length > 0) {
                filteredUsers.forEach(user => {
                    const userCard = document.createElement("div");
                    userCard.classList.add("col-12", "col-md-6", "mb-4");

                    userCard.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${user.name}</h5>
                                <p class="card-text">Edad: ${user.age}</p>
                                <p class="card-text">Ciudad: ${user.city}</p>
                                <a href="#" class="btn btn-primary">Ver perfil</a>
                            </div>
                        </div>
                    `;
                    searchResultsContainer.appendChild(userCard);
                });
            } else {
                searchResultsContainer.innerHTML = `
                    <div class="alert alert-warning text-center" role="alert">
                        No se encontraron resultados que coincidan con los criterios de búsqueda.
                    </div>
                `;
            }
           
        });
    } else {
        console.error("Formulario de búsqueda no encontrado.");
    }
}

function cargarLikes() {
    // Obtener el email del usuario actualmente logueado desde sessionStorage
    const loggedInUser = JSON.parse(sessionStorage.getItem('userLoggedIn')) || {}; // Asegúrate de que este valor esté almacenado en sessionStorage
    const likes = JSON.parse(sessionStorage.getItem('meGusta')) || []; // Si no hay datos, usar un array vacío

    // Obtener el contenedor donde se mostrarán los likes
    const likesContainer = document.getElementById('likesContainer');

    // Verificar si existen "me gusta" guardados
    if (likes.length > 0) {
        // Limpiar el contenedor en caso de que haya contenido previo
        likesContainer.innerHTML = '';

        // Filtrar los "me gusta" donde el email2 coincida con el usuario logueado o donde el usuario esté en email1
        const filteredLikes = likes.filter(like => like.email2 === loggedInUser.email || like.email1 === loggedInUser.email);

        // Verificar si hay "me gusta" filtrados
        if (filteredLikes.length > 0) {
            // Recorrer los "me gusta" filtrados y mostrarlos en tarjetas
            filteredLikes.forEach(like => {
                // Comprobar si los campos están completos para evitar crear tarjetas vacías
                if (like.email1 && like.email2) {
                    const likeElement = document.createElement('div');
                    likeElement.classList.add('col-12', 'col-md-6', 'mb-4'); // Clases de Bootstrap para organizar los elementos

                    let matchMessage = '';

                    // Comprobar si es un "match" (si el usuario logueado está en email1 y en email2 de otro like)
                    if (like.email1 === loggedInUser.email && likes.some(otherLike => otherLike.email1 === like.email2 && otherLike.email2 === loggedInUser.email)) {
                        // Si el usuario está en email1 y también existe un "me gusta" del email2 hacia el usuario logueado
                        matchMessage = `¡Es un match con ${like.email2}! Ambos se gustan.`;
                    } else if (like.email2 === loggedInUser.email) {
                        // Si solo el email2 coincide, es un "me gusta"
                        matchMessage = `¡A ${like.email1} le gustas!`;
                    }

                    likeElement.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${matchMessage}</h5>
                                <p class="card-text">
                                    ¡Estás en su lista de favoritos! Conecta con ellos y conoce más.
                                </p>
                                <a href="#" class="btn btn-primary">Ver perfil</a>
                            </div>
                        </div>
                    `;
                    if(matchMessage!==""){
                        console.log(matchMessage);
                        likesContainer.appendChild(likeElement);
                    }
                    
                }
            });
        } else {
            // Si no hay "me gusta" filtrados, mostrar un mensaje
            likesContainer.innerHTML = `
                <div class="alert alert-warning text-center" role="alert">
                    No tienes "Me Gusta" registrados.
                </div>
            `;
        }
    } else {
        // Si no hay "me gusta", mostrar un mensaje
        likesContainer.innerHTML = `
            <div class="alert alert-info text-center" role="alert">
                No hay "Me Gusta" registrados.
            </div>
        `;
    }
}
