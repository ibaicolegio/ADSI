export function cargarLikes(obtenerLikesDesdeIndexedDB, obtenerUsuariosDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB) {
    // Obtener el email del usuario actualmente logueado desde sessionStorage
    const loggedInUser = JSON.parse(sessionStorage.getItem('userLoggedIn')) || {}; // Asegúrate de que este valor esté almacenado en sessionStorage

    // Obtener los contenedores donde se mostrarán los likes y los matches
    const likesContainer = document.getElementById('likesContainer');
    const matchContainer = document.getElementById('matchContainer');

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
                        // Inicializar los arrays para los matches y los likes
                        const matches = [];
                        const likes = [];

                        filteredLikes.forEach(like => {
                            if (like.email1 && like.email2) {
                                if (
                                        like.email1 === loggedInUser.email &&
                                        filteredLikes.some(otherLike => otherLike.email1 === like.email2 && otherLike.email2 === loggedInUser.email)
                                        ) {
                                    // Es un match
                                    matches.push({user1: like.email1, user2: like.email2});
                                } else if (like.email2 === loggedInUser.email) {
                                    // Es un like hacia el usuario logueado
                                    likes.push(like.email1);
                                }
                            }
                        });

                        // Filtrar los likes para excluir usuarios que ya están en matches
                        const matchEmails = matches.map(match => match.user2); // Emails del otro usuario en los matches
                        const filteredLikesWithoutMatches = likes.filter(email => !matchEmails.includes(email));

                        // Recorremos los matches primero
                        matches.forEach(match => {
                            const matchElement = document.createElement("div");
                            matchElement.classList.add("col-12", "col-md-6", "mb-4");

                            // Crear mensaje de match con corazón
                            const matchMessage = `¡Es un match con ${match.user2}! Ambos se gustan. <i class="fa fa-heart" style="color: red;"></i>`;

                            matchElement.innerHTML = `
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${matchMessage}</h5>
                                    <p class="card-text">¡Estás en su lista de favoritos! Conecta con ellos y conoce más.</p>
                                    <a href="#" class="btn btn-primary view-profile-button" data-email="${match.user2}">Ver perfil</a>
                                </div>
                            </div>
                        `;

                            // Añadir el elemento al contenedor de matches
                            matchContainer.appendChild(matchElement);
                        });

                        // Recorremos los likes
                        filteredLikesWithoutMatches.forEach(likeEmail => {
                            const likeElement = document.createElement("div");
                            likeElement.classList.add("col-12", "col-md-6", "mb-4");

                            // Crear mensaje de "me gusta"
                            const likeMessage = `¡A ${likeEmail} le gustas!`;

                            likeElement.innerHTML = `
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${likeMessage}</h5>
                                    <p class="card-text">
                                        ¡Estás en su lista de favoritos! Conecta con ellos y conoce más.
                                    </p>
                                    <a href="#" class="btn btn-primary view-profile-button" data-email="${likeEmail}">Ver perfil</a>
                                </div>
                            </div>
                        `;

                            // Añadir el elemento al contenedor de likes
                            likesContainer.appendChild(likeElement);
                        });

                        // Agregar evento a los botones "Ver perfil"
                        const viewProfileButtons = document.querySelectorAll(".view-profile-button");
                        viewProfileButtons.forEach(button => {
                            button.addEventListener("click", function (event) {
                                event.preventDefault();
                                const userEmail = button.getAttribute("data-email");
                                const content = document.getElementById("main");
                                // Guardar el correo en sessionStorage
                                sessionStorage.getItem("selectedUserEmail", userEmail);

                                // Si está autenticado, cargar el perfil
                                fetch("./views/verPerfil.html")
                                        .then((response) => {
                                            if (!response.ok)
                                                throw new Error("Página no encontrada.");
                                            return response.text();
                                        })
                                        .then((html) => {
                                            content.innerHTML = html;
                                            loadUserProfile(obtenerUsuariosDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, userEmail);
                                        })
                                        .catch((error) => {
                                            content.innerHTML = `<p>Error: ${error.message}</p>`;
                                        });

                            });
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

export function loadUserProfile(obtenerUsuariosDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, emailUsuario) {
    // Primero, obtenemos los usuarios desde IndexedDB
    obtenerUsuariosDesdeIndexedDB()
            .then((usuarios) => {
                // Buscar al usuario con el email especificado
                const user = usuarios.find(u => u.email === emailUsuario);
                console.log(user);
                if (user) {
                    // Rellenar los datos del perfil
                    document.getElementById("userName").textContent = `Nombre: ${user.nombre}`;
                    document.getElementById("userAge").textContent = `Edad: ${user.edad}`;
                    document.getElementById("userCity").textContent = `Ciudad: ${user.ciudad}`;

                    // Si la foto está en Base64, la asignamos al atributo src del img
                    if (user.foto) {
                        document.getElementById("userImage").src = `data:image/jpeg;base64,${user.foto}`;
                    } else {
                        // Si no hay foto, se asigna una imagen por defecto
                        document.getElementById("userImage").src = "https://via.placeholder.com/100";
                    }

                    // Obtener las aficiones del usuario
                    return obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario);
                } else {
                    throw new Error("Usuario no encontrado.");
                }
            })
            .then((aficiones) => {
                // Rellenar las aficiones
                const hobbiesList = document.getElementById("userHobbies");
                hobbiesList.innerHTML = ""; // Limpiar la lista de aficiones antes de llenarla
                aficiones.forEach((aficion) => {
                    const li = document.createElement("li");
                    li.textContent = aficion.nombre;
                    hobbiesList.appendChild(li);
                });
            })
            .catch((error) => {
                console.error("Error al cargar el perfil:", error);
                alert("Error al cargar el perfil.");
            });
}

export async function buscar(obtenerUsuariosDesdeIndexedDB, obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, content, view) {
    // Obtener el formulario de búsqueda y el contenedor de resultados
    const searchForm = document.getElementById("searchForm");
    const searchResultsContainer = document.getElementById("searchResultsContainer");
    const busquedaExtra = document.getElementById("busquedaExtra");
    const isAuthenticated = sessionStorage.getItem("userLoggedIn");

    if (isAuthenticated) {
        try {
            // Obtener aficiones desde IndexedDB
            const aficiones = await obtenerAficionesDesdeIndexedDB();

            // Limpiar contenido anterior
            busquedaExtra.innerHTML = '';

            // Añadir el label principal
            const labelPrincipal = document.createElement("label");
            labelPrincipal.htmlFor = "busquedaExtra";
            labelPrincipal.textContent = "Selecciona tus aficiones:";
            labelPrincipal.classList.add("form-label", "mb-3", "d-block");
            busquedaExtra.appendChild(labelPrincipal);

            // Crear el contenedor para las aficiones
            const aficionesContainer = document.createElement("div");
            aficionesContainer.classList.add("row", "g-3");

            aficiones.forEach(aficion => {
                const item = document.createElement("div");
                item.classList.add("col-md-3"); // Controla el diseño de las aficiones

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = "aficiones";
                checkbox.value = aficion.nombreAficion;
                checkbox.id = `aficion-${aficion.nombreAficion.toLowerCase()}`;
                checkbox.classList.add("form-check-input", "me-2");

                const label = document.createElement("label");
                label.htmlFor = checkbox.id;
                label.textContent = aficion.nombreAficion;
                label.classList.add("form-check-label");

                // Añadir el checkbox y la etiqueta al contenedor
                item.appendChild(checkbox);
                item.appendChild(label);
                aficionesContainer.appendChild(item);
            });

            // Añadir el contenedor de aficiones al div principal
            busquedaExtra.appendChild(aficionesContainer);

        } catch (error) {
            console.error("Error al obtener aficiones:", error);
        }
    }

    // Verificar si el formulario existe
    if (searchForm) {
        // Manejar el evento de envío del formulario
        searchForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevenir la recarga de la página

            // Obtener los valores del formulario
            const genero = document.getElementById("genero").value;
            const minAge = parseInt(document.getElementById("minAge").value, 10);
            const maxAge = parseInt(document.getElementById("maxAge").value, 10);
            const ciudad = document.getElementById("ciudad").value.toLowerCase();

            // Obtener las aficiones seleccionadas
            const selectedAficiones = Array.from(document.querySelectorAll('input[name="aficiones"]:checked')).map(checkbox => checkbox.value);

            // Obtener la lista de usuarios desde IndexedDB
            obtenerUsuariosDesdeIndexedDB()
                    .then(async (users) => {
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
                        const filteredUsers = await Promise.all(users.map(async user => {
                            const userCiudad = user.ciudad ? user.ciudad.toLowerCase() : "";
                            const userEmail = user.email;

                            // Obtener las aficiones del usuario
                            const userAficiones = await obtenerAficionesUsuarioDesdeIndexedDB(userEmail);

                            // Verificar si el usuario tiene alguna de las aficiones seleccionadas
                            const hasSelectedAficion = selectedAficiones.length === 0 || userAficiones.some(aficion => selectedAficiones.includes(aficion.nombre));

                            return (
                                    (!genero || generoValue.includes(user.genero)) &&
                                    (!isNaN(minAge) && user.edad >= minAge) &&
                                    (!isNaN(maxAge) && user.edad <= maxAge) &&
                                    (!ciudad || userCiudad === ciudad) &&
                                    hasSelectedAficion // Filtrar por aficiones
                                    ) ? user : null;
                        }));

                        // Filtrar los resultados nulos
                        const validFilteredUsers = filteredUsers.filter(user => user !== null);

                        // Limpiar resultados previos
                        searchResultsContainer.innerHTML = "";

                        // Mostrar los resultados o un mensaje si no hay coincidencias
                        if (validFilteredUsers.length > 0) {
                            validFilteredUsers.forEach(user => {
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
                                        if (isAuthenticated && isSelectedUserEmail) {
                                            fetch("./views/verPerfil.html")
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
                                        // Si está autenticado, permitir ver el perfil
                                        console.log(`Mostrar perfil de usuario: ${userEmail}`);
                                        // Aquí podrías cargar la página de detalles de perfil o hacer lo que desees
                                    }
                                });
                            });

                        } else {
                            searchResultsContainer.innerHTML = `
                            <p class="text-center">No se encontraron resultados que coincidan con la búsqueda.</p>
                        `;
                        }
                    })
                    .catch(error => {
                        console.error("Error al obtener usuarios:", error);
                    });
        });
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
                    welcomeMessage.textContent = `Hola, ${user.nombre || "Usuario"} `;
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

export function cargarAficiones(obtenerAficionesUsuarioDesdeIndexedDB, content) {
    const loggedInUser = JSON.parse(sessionStorage.getItem("userLoggedIn"));
    const emailUsuario = loggedInUser?.email;

    if (!emailUsuario) {
        content.innerHTML = "<p>Error: No se encontró el usuario logueado.</p>";
        return;
    }

    const detailsElement = document.getElementById("aficionDetails");

    if (!detailsElement) {
        console.error("El elemento detailsElement no está disponible en el DOM.");
        return;
    }

    // Limpiar el contenido existente
    detailsElement.innerHTML = "";

    // Cargar aficiones del usuario
    obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario)
            .then((aficiones) => {
                if (aficiones.length === 0) {
                    detailsElement.innerHTML =
                            "<p class='alert alert-info'>No tienes aficiones registradas.</p>";
                    return;
                }

                // Crear tarjetas para cada afición
                aficiones.forEach((aficion) => {
                    const card = document.createElement("div");
                    card.classList.add(
                            "col-12",
                            "col-sm-6",
                            "col-md-4",
                            "d-flex",
                            "align-items-stretch"
                            );

                    card.innerHTML = `
                    <div class="card shadow-sm border-light rounded-3 overflow-hidden">
                        <img src="https://via.placeholder.com/350x200?text=${encodeURIComponent(
                            aficion.nombre
                            )}" class="card-img-top" alt="${aficion.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${aficion.nombre}</h5>
                        </div>
                    </div>
                `;

                    detailsElement.appendChild(card);
                });
            })
            .catch((error) => {
                console.error("Error al cargar aficiones:", error);
                detailsElement.innerHTML = `<p class="alert alert-danger">Error al cargar aficiones: ${error}</p>`;
            });
}


export function añadirAficion(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, añadirAficionesSeleccionadas, openIndexedDB) {
    const loggedInUser = JSON.parse(sessionStorage.getItem("userLoggedIn"));

    // Verificar si el usuario está logueado y tiene un email válido
    if (!loggedInUser || !loggedInUser.email) {
        console.error("Error: No se encontró el usuario logueado.");
        return;
    }

    const emailUsuario = loggedInUser.email;

    const checkboxContainer = document.getElementById("aficionesCheckboxContainer");
    const guardarAficionesButton = document.getElementById("guardarAficionesButton");

    // Verificar si los elementos del DOM están disponibles
    if (!checkboxContainer || !guardarAficionesButton) {
        console.error("Elementos necesarios no encontrados en el DOM.");
        return;
    }

    checkboxContainer.innerHTML = ""; // Limpiar checkboxes existentes

    // Obtener aficiones desde IndexedDB
    Promise.all([
        obtenerAficionesDesdeIndexedDB(),
        obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario)
    ])
            .then(([todasAficiones, aficionesUsuario]) => {
                console.log("Todas las aficiones:", todasAficiones);
                console.log("Aficiones del usuario:", aficionesUsuario);

                // Obtener los IDs de las aficiones que ya tiene el usuario
                const idsAficionesUsuario = aficionesUsuario.map(aficion => aficion.idAficion);
                // Filtrar las aficiones disponibles para añadir (que no estén ya asociadas al usuario)
                const aficionesDisponibles = todasAficiones.filter(aficion => !idsAficionesUsuario.includes(aficion.idAficion));

                if (aficionesDisponibles.length === 0) {
                    checkboxContainer.innerHTML = "<p>No hay aficiones disponibles para añadir.</p>";
                    guardarAficionesButton.style.display = "none";
                    return;
                }

                crearCheckboxes(aficionesDisponibles, checkboxContainer);
                guardarAficionesButton.style.display = "block";

                // Eliminar cualquier evento anterior y agregar el nuevo
                guardarAficionesButton.removeEventListener("click", guardarAficionesEventHandler);
                guardarAficionesButton.addEventListener("click", guardarAficionesEventHandler);

                function guardarAficionesEventHandler() {
                    const checkboxes = checkboxContainer.querySelectorAll("input[type='checkbox']");

                    // Depuración: Verificar qué checkboxes están seleccionados
                    const seleccionadas = Array.from(checkboxes)
                            .filter(checkbox => checkbox.checked)
                            .map(checkbox => Number(checkbox.value)); // Convertir valores a números

                    console.log("Aficiones seleccionadas:", seleccionadas);  // Depuración

                    // Si no se selecciona ninguna afición, mostrar un mensaje y salir de la función
                    if (seleccionadas.length === 0) {
                        alert("No has seleccionado ninguna afición.");
                        return; // Salir de la función sin intentar abrir IndexedDB
                    }

                    // Abrir IndexedDB y añadir las nuevas aficiones
                    openIndexedDB().then(db => {
                        añadirAficionesSeleccionadas(db, emailUsuario, seleccionadas)
                                .then((mensaje) => {
                                    alert(mensaje);  // Mostrar el mensaje de éxito
                                    const content = document.getElementById("main");
                                    fetch("./views/añadirAficion.html")
                                            .then((response) => {
                                                if (!response.ok)
                                                    throw new Error("Página no encontrada.");
                                                return response.text();
                                            })
                                            .then((html) => {
                                                content.innerHTML = html;
                                                añadirAficion(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, añadirAficionesSeleccionadas, openIndexedDB);

                                            })
                                            .catch((error) => {
                                                content.innerHTML = `<p>Error: ${error.message}</p>`;
                                            });

                                })
                                .catch((error) => {
                                    console.error(error);
                                    alert(error);  // Mostrar el error de IndexedDB
                                });
                    }).catch(error => {
                        console.error("Error al abrir IndexedDB:", error);
                        alert("Error al abrir IndexedDB: " + error);  // Mostrar un error si no se puede abrir IndexedDB
                    });
                }

                // Función para crear los checkboxes de las aficiones disponibles
                function crearCheckboxes(aficionesDisponibles, container) {
                    aficionesDisponibles.forEach(aficion => {
                        const checkboxDiv = document.createElement("div");
                        checkboxDiv.classList.add("col-6", "mb-2");

                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.id = `aficion-${aficion.idAficion}`;
                        checkbox.value = aficion.idAficion;
                        checkbox.classList.add("form-check-input");

                        const label = document.createElement("label");
                        label.htmlFor = `aficion-${aficion.idAficion}`;
                        label.classList.add("form-check-label");
                        label.textContent = aficion.nombreAficion;

                        checkboxDiv.appendChild(checkbox);
                        checkboxDiv.appendChild(label);
                        container.appendChild(checkboxDiv);
                    });
            }
            })
            .catch(error => {
                console.error("Error al cargar aficiones o aficiones de usuario:", error);
            });
}

export function eliminarAficion(obtenerAficionesUsuarioDesdeIndexedDB, openIndexedDB) {
    const loggedInUser = JSON.parse(sessionStorage.getItem("userLoggedIn"));
    const emailUsuario = loggedInUser?.email;

    if (!emailUsuario) {
        console.error("Error: No se encontró el usuario logueado.");
        return;
    }

    const checkboxContainer = document.getElementById("aficionesCheckboxContainer");
    const eliminarAficionesButton = document.getElementById("eliminarAficionesButton");

    if (!checkboxContainer || !eliminarAficionesButton) {
        console.error("Elementos necesarios no encontrados en el DOM.");
        return;
    }

    // Limpiar contenedor de checkboxes
    checkboxContainer.innerHTML = "";

    // Obtener las aficiones del usuario desde IndexedDB
    obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario)
            .then(aficionesUsuario => {
                if (aficionesUsuario.length === 0) {
                    checkboxContainer.innerHTML = "<p>No tienes aficiones para eliminar.</p>";
                    eliminarAficionesButton.style.display = "none";
                    return;
                }

                // Crear checkboxes para las aficiones del usuario
                aficionesUsuario.forEach(aficion => {
                    const checkboxDiv = document.createElement("div");
                    checkboxDiv.classList.add("col-6", "mb-2");

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = `aficion-${aficion.idAficion}`;
                    checkbox.value = aficion.idAficion;
                    checkbox.classList.add("form-check-input");

                    const label = document.createElement("label");
                    label.htmlFor = `aficion-${aficion.idAficion}`;
                    label.classList.add("form-check-label");
                    label.textContent = aficion.nombreAficion;

                    checkboxDiv.appendChild(checkbox);
                    checkboxDiv.appendChild(label);
                    checkboxContainer.appendChild(checkboxDiv);
                });

                // Mostrar el botón para eliminar aficiones
                eliminarAficionesButton.style.display = "block";

                // Limpiar eventos previos del botón
                eliminarAficionesButton.replaceWith(eliminarAficionesButton.cloneNode(true));
                const nuevoEliminarButton = document.getElementById("eliminarAficionesButton");

                // Registrar evento para eliminar las aficiones seleccionadas
                nuevoEliminarButton.addEventListener("click", () => {
                    const checkboxes = checkboxContainer.querySelectorAll("input[type='checkbox']");
                    const seleccionadas = Array.from(checkboxes)
                            .filter(checkbox => checkbox.checked)
                            .map(checkbox => Number(checkbox.value)); // Convertir valores a números

                    if (seleccionadas.length === 0) {
                        alert("No has seleccionado ninguna afición para eliminar.");
                        return;
                    }

                    openIndexedDB().then(db => {
                        const transaction = db.transaction("usuario_aficion", "readwrite");
                        const store = transaction.objectStore("usuario_aficion");

                        // Obtener las aficiones existentes del usuario
                        const existingRequest = store.getAll();
                        existingRequest.onsuccess = () => {
                            const existingAficiones = existingRequest.result.filter(item => item.email === emailUsuario);
                            const existingIds = existingAficiones.map(item => Number(item.idAficion));

                            // Filtrar las aficiones seleccionadas que se deben eliminar
                            const aficionesAEliminar = seleccionadas.filter(idAficion => existingIds.includes(idAficion));

                            if (aficionesAEliminar.length === 0) {
                                alert("No has seleccionado aficiones válidas para eliminar.");
                                return;
                            }

                            // Eliminar las aficiones seleccionadas
                            aficionesAEliminar.forEach(idAficion => {
                                const request = store.delete(idAficion); // Eliminar por id
                                request.onsuccess = () => {
                                    console.log(`Afición con ID ${idAficion} eliminada.`);
                                };
                                request.onerror = event => {
                                    console.error(`Error al eliminar la afición con ID ${idAficion}:`, event.target.error);
                                };
                            });

                            transaction.oncomplete = () => {
                                alert("¡Aficiones eliminadas exitosamente!");
                                cargarAficiones(obtenerAficionesUsuarioDesdeIndexedDB, document.getElementById("main"));
                            };

                            transaction.onerror = event => {
                                console.error("Error al eliminar aficiones en IndexedDB:", event.target.error);
                            };
                        };

                        existingRequest.onerror = event => {
                            console.error("Error al obtener las aficiones existentes del usuario:", event.target.error);
                        };
                    }).catch(error => {
                        console.error("Error al abrir IndexedDB:", error);
                    });
                });
            })
            .catch(error => {
                console.error("Error al cargar las aficiones del usuario:", error);
            });
}

export function initMap(openIndexedDB, obtenerUsuariosDesdeIndexedDB) {
    const mapContainer = document.getElementById("mapContainer");

    if (!navigator.geolocation) {
        mapContainer.innerHTML = `<p>Geolocalización no soportada por tu navegador.</p>`;
        console.error("Geolocalización no soportada por este navegador.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Crear el mapa centrado en la ubicación del usuario
            const map = new google.maps.Map(mapContainer, {
                center: userLocation,
                zoom: 14,
            });

            // Crear un círculo inicial
            const circle = new google.maps.Circle({
                map: map,
                center: userLocation,
                radius: 1000, // Radio inicial: 1 km
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                draggable: false, // Asegurarse de que el círculo no se pueda mover
            });

            // No mover el círculo ni cambiar su radio
            map.addListener("center_changed", () => {
                // No actualizar el centro del círculo
                // circle.setCenter(map.getCenter());  // Eliminar esta línea para evitar que el círculo se mueva
            });

            // No permitir que el radio se cambie desde el control deslizante
            const rangeInput = document.getElementById("range");
            const rangeValue = document.getElementById("rangeValue");

            // Deshabilitar el control deslizante de radio
            rangeInput.disabled = true;
            rangeValue.textContent = `${circle.getRadius() / 1000} km`; // Mostrar el valor fijo del radio

            // Cargar la base de datos IndexedDB
            openIndexedDB()
                .then(() => {
                    // Cargar y actualizar los marcadores iniciales
                    actualizarMarcadores(map, circle, obtenerUsuariosDesdeIndexedDB);
                })
                .catch((error) => {
                    console.error("Error al abrir la base de datos:", error);
                });
        },
        (error) => {
            console.error("Error obteniendo la ubicación:", error.message);
            mapContainer.innerHTML = `<p>No se pudo obtener la ubicación. Verifica los permisos de ubicación en tu navegador.</p>`;
        }
    );
}

function actualizarMarcadores(map, circle, obtenerUsuariosDesdeIndexedDB) {
    obtenerUsuariosDesdeIndexedDB()
        .then((usuarios) => {
            // Limpiar marcadores existentes
            if (map.markers) {
                map.markers.forEach(marker => marker.setMap(null));
            }
            map.markers = [];

            const circleCenter = circle.getCenter();
            const circleRadius = circle.getRadius();

            usuarios.forEach((usuario) => {
                const usuarioUbicacion = new google.maps.LatLng(usuario.lat, usuario.lng);

                // Comprobar si el usuario está dentro del círculo
                if (google.maps.geometry.spherical.computeDistanceBetween(circleCenter, usuarioUbicacion) <= circleRadius) {
                    // Crear un marcador para el usuario
                    const marker = new google.maps.Marker({
                        position: usuarioUbicacion,
                        map: map,
                        title: usuario.nombre
                    });

                    // Crear una ventana de información para mostrar más detalles
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <p><strong>${usuario.nombre}</strong></p>
                            <p>Edad: ${usuario.edad}</p>
                            <p>Ciudad: ${usuario.ciudad}</p>
                        `
                    });

                    // Mostrar la información al hacer clic en el marcador
                    marker.addListener("click", () => {
                        infoWindow.open(map, marker);
                    });

                    // Agregar el marcador a la lista
                    map.markers.push(marker);
                }
            });
        })
        .catch((error) => {
            console.error("Error obteniendo usuarios desde IndexedDB:", error);
        });
}

