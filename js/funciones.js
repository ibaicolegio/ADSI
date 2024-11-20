export function cargarLikes(obtenerLikesDesdeIndexedDB) {
    // Obtener el email del usuario actualmente logueado desde sessionStorage
    const loggedInUser = JSON.parse(sessionStorage.getItem('userLoggedIn')) || {}; // Asegúrate de que este valor esté almacenado en sessionStorage

    // Obtener el contenedor donde se mostrarán los likes
    const likesContainer = document.getElementById('likesContainer');

    // Obtener los "me gusta" desde IndexedDB
    obtenerLikesDesdeIndexedDB()
            .then(likes => {
                // Verificar si existen "me gusta"
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
                                if (matchMessage !== "") {
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
            })
            .catch(error => {
                console.error("Error al obtener los 'me gusta' desde IndexedDB:", error);
                likesContainer.innerHTML = `
                <div class="alert alert-danger text-center" role="alert">
                    Hubo un problema al acceder a la base de datos.
                </div>
            `;
            });
}

// Configurar el formulario de inicio de sesión
export function login(obtenerUsuariosDesdeIndexedDB) {
    const loginForm = document.getElementById("loginForm"); // Asegúrate de que exista en `views/login.html`

    if (loginForm) {
        // Manejar el envío del formulario de login
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Obtener los usuarios de IndexedDB
            obtenerUsuariosDesdeIndexedDB()
                    .then(users => {
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
                    })
                    .catch(error => {
                        console.error("Error al recuperar los usuarios desde IndexedDB:", error);
                        alert("Hubo un problema al acceder a la base de datos.");
                    });
        });
    } else {
        console.error("Formulario de login no encontrado. Verifica el archivo login.html");
    }
}




export function buscar(obtenerUsuariosDesdeIndexedDB, content, view) {
    // Obtener el formulario de búsqueda y el contenedor de resultados
    const searchForm = document.getElementById("searchForm");
    const searchResultsContainer = document.getElementById("searchResultsContainer");
    const busquedaExtra = document.getElementById("busquedaExtra");
    const isAuthenticated = sessionStorage.getItem("userLoggedIn");
    if(isAuthenticated){
        // Aficiones predefinidas
        const aficiones = [
            "Deportes",
            "Lectura",
            "Cine",
            "Viajar",
            "Música",
            "Cocina",
            "Arte",
            "Tecnología",
            "Jardinería",
            "Fotografía"
        ];

        // Obtener el contenedor de aficiones
        const busquedaExtra = document.getElementById("busquedaExtra");

        // Añadir el label principal
        const labelPrincipal = document.createElement("label");
        labelPrincipal.htmlFor = "busquedaExtra";
        labelPrincipal.textContent = "Selecciona tus aficiones:";
        labelPrincipal.classList.add("form-label", "mb-3", "d-block");
        busquedaExtra.appendChild(labelPrincipal);

        // Crear la lista de aficiones dinámicamente
        const aficionesContainer = document.createElement("div");
        aficionesContainer.classList.add("row", "g-3");

        aficiones.forEach(aficion => {
            // Crear un contenedor para cada afición (con tarjeta)
            const aficionContainer = document.createElement("div");
            aficionContainer.classList.add("aficion-item", "col-md-3");  // Cuatro ítems por fila en pantallas medianas

            // Crear el input (checkbox)
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "aficiones";
            checkbox.value = aficion;
            checkbox.id = `aficion-${aficion.toLowerCase()}`;
            checkbox.classList.add("form-check-input", "me-2");

            // Crear la etiqueta para el checkbox
            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = aficion;
            label.classList.add("form-check-label");

            // Añadir el checkbox y la etiqueta al contenedor de la afición
            aficionContainer.appendChild(checkbox);
            aficionContainer.appendChild(label);

            // Añadir el contenedor al contenedor principal de aficiones
            aficionesContainer.appendChild(aficionContainer);
        });

        // Añadir el contenedor de aficiones al div principal
        busquedaExtra.appendChild(aficionesContainer);

    }
    
    // Verificar si el formulario existe
    if (searchForm) {
        // Manejar el evento de envío del formulario
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevenir la recarga de la página

            // Obtener los valores del formulario
            const genero = document.getElementById("genero").value;
            const minAge = parseInt(document.getElementById("minAge").value, 10);
            const maxAge = parseInt(document.getElementById("maxAge").value, 10);
            const ciudad = document.getElementById("ciudad").value.toLowerCase();

            // Obtener la lista de usuarios desde IndexedDB
            obtenerUsuariosDesdeIndexedDB()
                    .then(users => {
                        let generoValue = ""; // Convertir las opciones del formulario a "M" o "H"
                        switch (genero) {
                            case "mujerHombre":
                            case "hombreHombre":
                                generoValue = "H";
                                break;
                            case "hombreMujer":
                            case "mujerMujer":
                                generoValue = "M";
                                break;
                            case "mujerAmbos":
                            case "hombreAmbos":
                                generoValue = ["H", "M"];
                                break;
                        }

                        // Filtrar los usuarios según los criterios
                        const filteredUsers = users.filter(user => {
                            const userCiudad = user.ciudad ? user.ciudad.toLowerCase() : "";
                            return (
                                    (!genero || generoValue.includes(user.genero)) &&
                                    (!isNaN(minAge) && user.edad >= minAge) &&
                                    (!isNaN(maxAge) && user.edad <= maxAge) &&
                                    (!ciudad || userCiudad === ciudad)
                                    );
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
                                    <div class="card-body d-flex align-items-center">
                                        <!-- Imagen del usuario a la derecha -->
                                        <div class="flex-grow-1">
                                            <h5 class="card-title">${user.nombre}</h5>
                                            <p class="card-text">Edad: ${user.edad}</p>
                                            <p class="card-text">Ciudad: ${user.ciudad}</p>
                                            <a href="#" id="viewProfileButton" class="btn btn-primary view-profile-button" data-email="${user.email}">Ver perfil</a>
                                        </div>
                                        <!-- Imagen en formato base64 -->
                                        <img 
                                            src="data:image/jpeg;base64,${user.foto}"
                                            class="rounded-circle ms-3" 
                                            style="width: 100px; height: 100px; object-fit: cover;">
                                    </div>
                                </div>
                            `;
                                searchResultsContainer.appendChild(userCard);
                            });
                            const isAuthenticated = sessionStorage.getItem("userLoggedIn");
                            if (!isAuthenticated) {
                                const images = document.querySelectorAll('img');
                                images.forEach(img => {
                                    img.style.filter = 'blur(5px)'; // Aplica el desenfoque de 5px
                                });
                            } 
                            
                            // Agregar evento a los botones "Ver perfil"
                            const viewProfileButtons = document.querySelectorAll("#viewProfileButton");
                            viewProfileButtons.forEach(button => {
                                button.addEventListener("click", function (event) {
                                    event.preventDefault();
                                    const userEmail = button.getAttribute("data-email");

// Guardar el correo en sessionStorage
                                    sessionStorage.setItem("selectedUserEmail", userEmail);
                                    
                                    // Verificar si el usuario está autenticado
                                    const isAuthenticated = sessionStorage.getItem("userLoggedIn");
                                    if (!isAuthenticated) {
                                        fetch("./views/login.html")
                                                .then((response) => {
                                                    if (!response.ok)
                                                        throw new Error("Página no encontrada.");
                                                    return response.text();
                                                })
                                                .then((html) => {
                                                    content.innerHTML = html;
                                                    login(obtenerUsuariosDesdeIndexedDB);
                                                })
                                                .catch((error) => {
                                                    content.innerHTML = `<p>Error: ${error.message}</p>`;
                                                });
                                    } else {
                                        const isAuthenticated = sessionStorage.getItem("userLoggedIn");
                            const isSelectedUserEmail = sessionStorage.getItem("selectedUserEmail");
                            if(isAuthenticated && isSelectedUserEmail){
                                fetch("./views/verPerfil.html")
                                                .then((response) => {
                                                    if (!response.ok)
                                                        throw new Error("Página no encontrada.");
                                                    return response.text();
                                                })
                                                .then((html) => {
                                                    content.innerHTML = html;
                                                })
                                                .catch((error) => {
                                                    content.innerHTML = `<p>Error: ${error.message}</p>`;
                                                });
                            }
                                        // Si está autenticado, permitir ver el perfil
                                        console.log(`Mostrar perfil de usuario: ${userEmail}`);
                                        // Aquí podrías cargar la página de detalles de perfil o hacer lo que desees
                                    }
                                });
                            });

                        } else {
                            searchResultsContainer.innerHTML = `
                            <div class="alert alert-warning text-center" role="alert">
                                No se encontraron resultados que coincidan con los criterios de búsqueda.
                            </div>
                        `;
                        }
                    })
                    .catch(error => {
                        console.error("Error al obtener los usuarios desde IndexedDB:", error);
                        searchResultsContainer.innerHTML = `
                        <div class="alert alert-danger text-center" role="alert">
                            Hubo un problema al acceder a la base de datos.
                        </div>
                    `;
                    });
        });
    } else {
        console.error("Formulario de búsqueda no encontrado.");
    }
}

export function cargarFotoYMensajeBienvenida(obtenerUsuariosDesdeIndexedDB) {
    // Obtener el email del usuario actualmente logueado desde sessionStorage
    const loggedInUser = JSON.parse(sessionStorage.getItem('userLoggedIn')) || {};

    // Verificar si el usuario está logueado
    if (loggedInUser.email) {
        // Obtener los usuarios desde IndexedDB
        obtenerUsuariosDesdeIndexedDB().then(users => {
            // Buscar el usuario logueado
            const user = users.find(u => u.email === loggedInUser.email);

            if (user) {
                // Mostrar mensaje de bienvenida
                const welcomeMessage = document.getElementById('welcomeMessage');
                if (loggedInUser) {
                    welcomeMessage.textContent = `Bienvenido, ${user.nombre || "Usuario"} `;
                }
                // Si el usuario tiene una foto en base64, mostrarla
                const userPhoto = document.getElementById('userPhoto');
                if (user.foto) {
                    userPhoto.src = `data:image/jpeg;base64,${user.foto}`; // Asumiendo que la foto está en Base64 en "fotoBase64"
                } else {
                    console.log("no hay foto");
                    userPhoto.src = ''; // Si no tiene foto, dejar el espacio vacío o asignar una imagen por defecto
                }
            }
        }).catch(error => {
            console.error('Error al cargar los datos del usuario desde IndexedDB:', error);
        });
    } else {
        console.log('Usuario no logueado');
    }
}

