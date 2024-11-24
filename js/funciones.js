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
                        console.log(matchEmails);
                        if (matchEmails.length === 0) {
                            console.log("no hay matches");
                            matchContainer.innerHTML = `
                        <div class="alert alert-warning text-center" role="alert">
                            No tienes "Matches" aún.
                        </div>
                    `;
                        }
                        if (filteredLikesWithoutMatches.length === 0) {
                            console.log("no hay likes");
                            likesContainer.innerHTML = `
                        <div class="alert alert-warning text-center" role="alert">
                            No tienes "Likes" aún.
                        </div>
                    `;
                        }
                        // Recorremos los matches primero
                        matches.forEach(match => {
                            const matchElement = document.createElement("div");
                            matchElement.classList.add("col-12", "col-md-6", "mb-4");

                            // Crear mensaje de match con corazón
                            const matchMessage = `¡Es un match con ${match.user2}! Ambos os gustais. <i class="fa fa-heart" style="color: red;"></i>`;

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
                                fetch("./html/verPerfil.html")
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
                        matchContainer.innerHTML = `
                        <div class="alert alert-warning text-center" role="alert">
                            No tienes "Matches" aún.
                        </div>
                    `;
                        // Si no hay "me gusta" filtrados, mostrar un mensaje
                        likesContainer.innerHTML = `
                        <div class="alert alert-warning text-center" role="alert">
                            No tienes "Likes" aún.
                        </div>
                    `;
                    }
                } else {
                    // Si no hay "me gusta", mostrar un mensaje
                    matchContainer.innerHTML = `
                        <div class="alert alert-warning text-center" role="alert">
                            No tienes "Matches" aún.
                        </div>
                    `;
                    // Si no hay "me gusta" filtrados, mostrar un mensaje
                    likesContainer.innerHTML = `
                        <div class="alert alert-warning text-center" role="alert">
                            No tienes "Likes" aún.
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
    const loginForm = document.getElementById("loginForm"); // Asegúrate de que exista en `html/login.html`

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

                    // Mostrar el mapa con la ubicación del usuario
                    if (user.lat && user.lng) {
                        showUserLocationOnMap(user.lat, user.lng);
                    } else {
                        console.warn("El usuario no tiene coordenadas disponibles.");
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

// Función para mostrar el mapa con la ubicación del usuario
function showUserLocationOnMap(lat, lng) {
    const mapContainer = document.getElementById("userMap");

    if (!mapContainer) {
        console.error("No se encontró el contenedor del mapa.");
        return;
    }

    // Crear un mapa centrado en las coordenadas del usuario
    const map = new google.maps.Map(mapContainer, {
        center: {lat, lng},
        zoom: 14,
    });

    // Añadir un marcador en la ubicación del usuario
    new google.maps.Marker({
        position: {lat, lng},
        map: map,
        title: "Ubicación del usuario",
    });
}

export async function buscar(obtenerUsuariosDesdeIndexedDB, obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, content, view) {
    // Obtener el formulario de búsqueda y el contenedor de resultados
    const searchForm = document.getElementById("searchForm");
    const searchResultsContainer = document.getElementById("searchResultsContainer");
    const busquedaExtra = document.getElementById("busquedaExtra");
    const isAuthenticated = sessionStorage.getItem("userLoggedIn");

    // Verificar si hay un usuario logueado
    let loggedInUserEmail = null;
    if (isAuthenticated) {
        try {
            const loggedInUser = JSON.parse(isAuthenticated);
            loggedInUserEmail = loggedInUser.email;
        } catch (error) {
            console.error("Error al parsear el usuario logueado:", error);
        }
    }

    // Obtener aficiones si está autenticado
    if (isAuthenticated) {
        try {
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

            try {
                // Obtener la lista de usuarios desde IndexedDB
                const users = await obtenerUsuariosDesdeIndexedDB();

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

                    // Excluir al usuario logueado
                    if (userEmail === loggedInUserEmail) {
                        return null;
                    }

                    // Obtener las aficiones del usuario
                    const userAficiones = await obtenerAficionesUsuarioDesdeIndexedDB(userEmail);

                    // Verificar si el usuario tiene alguna de las aficiones seleccionadas
                    const hasSelectedAficion = selectedAficiones.length === 0 || userAficiones.some(aficion => selectedAficiones.includes(aficion.nombre));

                    return (
                            (!genero || generoValue.includes(user.genero)) &&
                            (!isNaN(minAge) && user.edad >= minAge) &&
                            (!isNaN(maxAge) && user.edad <= maxAge) &&
                            (!ciudad || userCiudad === ciudad) &&
                            hasSelectedAficion
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
                                    <div class="flex-grow-1">
                                         <h5 class="card-title">${user.nombre}</h5>
                                          <p class="card-text">Edad: ${user.edad}</p>
                                          <p class="card-text">Ciudad: ${user.ciudad}</p>
                                    <a href="#" id="viewProfileButton" class="btn btn-primary view-profile-button" data-email="${user.email}">Ver perfil</a>
                                </div>
                                <img 
                                    src="data:image/jpeg;base64,${user.foto}" 
                                    class="rounded-circle user-image ms-3" 
                                    style="width: 100px; height: 100px; object-fit: cover;">
                                </div>
                              </div>
                        `;
                        searchResultsContainer.appendChild(userCard);
                    });

                    const isAuthenticated = sessionStorage.getItem("userLoggedIn");
                    if (!isAuthenticated) {
                        const userImages = document.querySelectorAll('img.user-image'); // Seleccionar solo imágenes de usuarios
                        userImages.forEach(img => {
                            img.style.filter = 'blur(5px)'; // Aplica el desenfoque
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
                                fetch("./html/login.html")
                                        .then((response) => response.text())
                                        .then((html) => {
                                            content.innerHTML = html;
                                            login(obtenerUsuariosDesdeIndexedDB);
                                        })
                                        .catch((error) => {
                                            content.innerHTML = `<p>Error: ${error.message}</p>`;
                                        });
                            } else {
                                const isSelectedUserEmail = sessionStorage.getItem("selectedUserEmail");
                                if (isSelectedUserEmail) {
                                    fetch("./html/verPerfil.html")
                                            .then((response) => response.text())
                                            .then((html) => {
                                                content.innerHTML = html;
                                                loadUserProfile(obtenerUsuariosDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, isSelectedUserEmail);
                                            })
                                            .catch((error) => {
                                                content.innerHTML = `<p>Error: ${error.message}</p>`;
                                            });
                                }
                            }
                        });
                    });
                } else {
                    searchResultsContainer.innerHTML = `
                        <p class="text-center">No se encontraron resultados que coincidan con la búsqueda.</p>
                    `;
                }
            } catch (error) {
                console.error("Error al obtener usuarios:", error);
            }
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
                                    fetch("./html/añadirAficion.html")
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


export function eliminarAficiones(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, eliminarAficionesSeleccionadas, openIndexedDB) {
    const loggedInUser = JSON.parse(sessionStorage.getItem("userLoggedIn"));

    // Verificar si el usuario está logueado y tiene un email válido
    if (!loggedInUser || !loggedInUser.email) {
        console.error("Error: No se encontró el usuario logueado.");
        return;
    }

    const emailUsuario = loggedInUser.email;

    const checkboxContainer = document.getElementById("aficionesCheckboxContainer");
    const eliminarAficionesButton = document.getElementById("eliminarAficionesButton");

    // Verificar si los elementos del DOM están disponibles
    if (!checkboxContainer || !eliminarAficionesButton) {
        console.error("Elementos necesarios no encontrados en el DOM.");
        return;
    }

    checkboxContainer.innerHTML = ""; // Limpiar checkboxes existentes

    // Obtener todas las aficiones y las seleccionadas por el usuario desde IndexedDB
    Promise.all([
        obtenerAficionesDesdeIndexedDB(), // Todas las aficiones disponibles
        obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario) // Aficiones seleccionadas por el usuario
    ])
            .then(([todasAficiones, aficionesUsuario]) => {
                console.log("Todas las aficiones disponibles:", todasAficiones);
                console.log("Aficiones del usuario:", aficionesUsuario);

                // Obtener las aficiones que el usuario tiene seleccionadas
                const idsAficionesUsuario = aficionesUsuario.map(aficion => Number(aficion.idAficion));
                const aficionesSeleccionadas = todasAficiones.filter(aficion => idsAficionesUsuario.includes(Number(aficion.idAficion)));

                if (aficionesSeleccionadas.length === 0) {
                    checkboxContainer.innerHTML = "<p>No tienes aficiones seleccionadas para eliminar.</p>";
                    eliminarAficionesButton.style.display = "none"; // Ocultar el botón si no hay aficiones
                    return;
                }

                crearCheckboxes(aficionesSeleccionadas, checkboxContainer);

                eliminarAficionesButton.style.display = "block"; // Mostrar el botón

                // Eliminar cualquier evento anterior y agregar el nuevo
                eliminarAficionesButton.removeEventListener("click", eliminarAficionesEventHandler);
                eliminarAficionesButton.addEventListener("click", eliminarAficionesEventHandler);

                function eliminarAficionesEventHandler() {
                    const checkboxes = checkboxContainer.querySelectorAll("input[type='checkbox']");
                    const seleccionadas = Array.from(checkboxes)
                            .filter(checkbox => checkbox.checked)
                            .map(checkbox => Number(checkbox.value)); // Convertir valores a números

                    if (seleccionadas.length === 0) {
                        alert("No has seleccionado ninguna afición para eliminar.");
                        return;
                    }
                    console.log(seleccionadas);

                    // Abrir IndexedDB y eliminar las aficiones seleccionadas
                    openIndexedDB()
                            .then(db => {
                                eliminarAficionesSeleccionadas(db, emailUsuario, seleccionadas)
                                        .then((mensaje) => {
                                            alert(mensaje); // Mostrar el mensaje de éxito
                                            const content = document.getElementById("main");
                                            fetch("./html/eliminarAficion.html")
                                                    .then((response) => {
                                                        if (!response.ok)
                                                            throw new Error("Página no encontrada.");
                                                        return response.text();
                                                    })
                                                    .then((html) => {
                                                        content.innerHTML = html;
                                                        eliminarAficiones(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, eliminarAficionesSeleccionadas, openIndexedDB);

                                                    })
                                                    .catch((error) => {
                                                        content.innerHTML = `<p>Error: ${error.message}</p>`;
                                                    });
                                        })
                                        .catch((error) => {
                                            console.error(error);
                                            alert(error); // Mostrar el error
                                        });
                            })
                            .catch(error => {
                                console.error("Error al abrir IndexedDB:", error);
                                alert("Error al abrir IndexedDB: " + error); // Mostrar un error si no se puede abrir IndexedDB
                            });
                }

                // Función para crear los checkboxes de las aficiones seleccionadas
                function crearCheckboxes(aficiones, container) {
                    aficiones.forEach(aficion => {
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
                console.error("Error al cargar las aficiones:", error);
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

        // No mover el círculo ni cambiar su centro al interactuar con el mapa
        map.addListener("center_changed", () => {
            // No hacer nada aquí
        });

        // Permitir cambiar el radio con el control deslizante
        const rangeInput = document.getElementById("range");
        const rangeValue = document.getElementById("rangeValue");

        rangeInput.addEventListener("input", () => {
            const radiusInKm = parseFloat(rangeInput.value);
            circle.setRadius(radiusInKm * 1000); // Convertir km a metros
            rangeValue.textContent = `${radiusInKm} km`; // Actualizar el valor del radio
            // Actualizar marcadores después de cambiar el radio
            actualizarMarcadores(map, circle, obtenerUsuariosDesdeIndexedDB);
        });

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

export function modificarPerfil(db, actualizarUsuarioEnIndexedDB, obtenerUsuariosDesdeIndexedDB) {
    const form = document.getElementById("localStorageForm");
    const profilePhotoInput = document.getElementById("profilePhoto");
    const citySelect = document.getElementById("citySelect");

    if (!form || !profilePhotoInput || !citySelect) {
        console.error("Formulario o elementos no encontrados en el DOM.");
        return;
    }

    // Obtener el usuario actualmente logueado desde sessionStorage
    const userLoggedIn = JSON.parse(sessionStorage.getItem("userLoggedIn"));

    if (!userLoggedIn) {
        console.error("No hay usuario logueado.");
        return;
    }

    // Mostrar la imagen actual si ya existe
    if (userLoggedIn.foto) {
        mostrarImagenEnInput("data:image/jpeg;base64," + userLoggedIn.foto);
    }

    // Preseleccionar la ciudad del usuario
    if (userLoggedIn.ciudad) {
        citySelect.value = userLoggedIn.ciudad;
    }

    // Manejar el cambio de imagen
    profilePhotoInput.addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const base64Image = e.target.result;

                // Mostrar la imagen seleccionada en el input
                mostrarImagenEnInput(base64Image);

                // Actualizar la foto en sessionStorage
                userLoggedIn.foto = base64Image.split(",")[1]; // Guardar solo la parte Base64
                sessionStorage.setItem("userLoggedIn", JSON.stringify(userLoggedIn));
            };

            reader.readAsDataURL(file);
        }
    });

    // Manejar el cambio de ciudad
    citySelect.addEventListener("change", function () {
        const selectedCity = citySelect.value;

        // Actualizar la ciudad en sessionStorage
        userLoggedIn.ciudad = selectedCity;
        sessionStorage.setItem("userLoggedIn", JSON.stringify(userLoggedIn));
    });

    // Manejar el envío del formulario (cuando el usuario presione "Guardar")
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Actualizar el perfil del usuario en IndexedDB
        actualizarUsuarioEnIndexedDB(db, userLoggedIn).then(() => {
            alert("Cambios guardados exitosamente.");
        }).catch((error) => {
            console.error("Error al guardar los cambios:", error);
            alert("Hubo un problema al guardar los cambios.");
        });
        cargarFotoYMensajeBienvenida(obtenerUsuariosDesdeIndexedDB);
    });
}

// Función para mostrar la imagen en el lugar del nombre del archivo
function mostrarImagenEnInput(base64Image) {
    const profilePhotoInput = document.getElementById("profilePhoto");

    // Crear una imagen para reemplazar el texto del input
    const imagePreview = document.createElement("img");
    imagePreview.src = base64Image;
    imagePreview.alt = "Foto de perfil";
    imagePreview.style.width = "150px";
    imagePreview.style.height = "150px";
    imagePreview.style.objectFit = "cover";
    imagePreview.style.borderRadius = "50%";

    // Reemplazar el texto del input
    const parent = profilePhotoInput.parentElement;
    const existingPreview = parent.querySelector("img");

    if (existingPreview) {
        existingPreview.replaceWith(imagePreview);
    } else {
        parent.appendChild(imagePreview);
    }
}

