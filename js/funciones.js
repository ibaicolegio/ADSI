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
                                    matches.push({ user1: like.email1, user2: like.email2 });
                                } else if (like.email2 === loggedInUser.email) {
                                    // Es un like hacia el usuario logueado
                                    likes.push(like.email1);
                                }
                            }
                        });

                        // Filtrar los likes para excluir usuarios que ya están en matches
                        const matchEmails = matches.map(match => match.user2); // Emails del otro usuario en los matches
                        const filteredLikesWithoutMatches = likes.filter(email => !matchEmails.includes(email)); // Filtrar likes
                        console.log(likes);
                        console.log(matches);

                        // Recorremos los matches primero
                        matches.forEach(match => {
                            const likeElement = document.createElement("div");
                            likeElement.classList.add("col-12", "col-md-6", "mb-4");

                            // Crear mensaje de match
                            const matchMessage = `¡Es un match con ${match.user2}! Ambos se gustan.`;

likeElement.innerHTML = `
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">${matchMessage} <i class="fa fa-heart" style="color: red;"></i></h5>
            <p class="card-text">¡Estás en su lista de favoritos! Conecta con ellos y conoce más.</p>
            <a href="#" class="btn btn-primary">Ver perfil</a>
        </div>
    </div>
`;

                            // Añadir el elemento al contenedor si tiene mensaje
                            if (matchMessage !== "") {
                                console.log(matchMessage);
                                likesContainer.appendChild(likeElement);
                            }
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
                <a href="#" class="btn btn-primary">Ver perfil</a>
            </div>
        </div>
    `;

                            // Añadir el elemento al contenedor si tiene mensaje
                            if (likeMessage !== "") {
                                console.log(likeMessage);
                                likesContainer.appendChild(likeElement);
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
    if (isAuthenticated) {
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
                                        if (isAuthenticated && isSelectedUserEmail) {
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

    const selectElement = document.getElementById("aficionesSelect");
    const detailsElement = document.getElementById("aficionDetails");

    // Verificar que los elementos existen
    if (!selectElement || !detailsElement) {
        console.error("Los elementos selectElement o detailsElement no están disponibles en el DOM.");
        return;
    }
    
    // Limpiar el contenido existente
    selectElement.innerHTML = `<option value="" disabled selected>Ver aficiones</option>`;
    detailsElement.innerHTML = "";

    // Cargar aficiones del usuario
    obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario)
        .then((aficiones) => {
            if (aficiones.length === 0) {
                // Si no hay aficiones, ocultamos el desplegable y mostramos un mensaje
                selectElement.style.display = "none"; // Ocultamos el desplegable
                detailsElement.innerHTML = "<p>No tienes aficiones registradas.</p>";
                return;
            }

            // Si hay aficiones, mostramos el desplegable
            selectElement.style.display = "block"; // Aseguramos que el desplegable esté visible

            // Comprobamos si cada afición tiene un nombre
            aficiones.forEach((aficion) => {
                if (!aficion.nombre) {
                    console.warn(`Afición con ID ${aficion.idAficion} no tiene nombre.`);
                }
            });

            // Crear opciones para el select
            aficiones.forEach((aficion) => {
                // Si no tiene nombre, mostramos un valor predeterminado
                const nombreAficion = aficion.nombre || "Nombre no disponible";
                const option = document.createElement("option");
                option.value = aficion.idAficion;
                option.textContent = nombreAficion; // Asegúrate de que 'nombre' es el campo correcto
                option.disabled = true; // Deshabilitamos la opción para que no se pueda seleccionar
                selectElement.appendChild(option);
            });

            // Manejar el cambio de selección
            selectElement.addEventListener("change", () => {
                const selectedId = selectElement.value;
                const selectedAficion = aficiones.find(
                    (aficion) => aficion.idAficion === selectedId
                );

                if (selectedAficion) {
                    detailsElement.innerHTML = `
                        <h3>${selectedAficion.nombre}</h3>
                        <p>ID: ${selectedAficion.idAficion}</p>
                    `;
                }
            });
        })
        .catch((error) => {
            console.error("Error al cargar aficiones:", error);
            detailsElement.innerHTML = `<p>Error al cargar aficiones: ${error}</p>`;
        });
}

export function añadirAficion(obtenerAficionesDesdeIndexedDB, obtenerAficionesUsuarioDesdeIndexedDB, openIndexedDB) {
    const loggedInUser = JSON.parse(sessionStorage.getItem("userLoggedIn"));
    const emailUsuario = loggedInUser?.email;

    if (!emailUsuario) {
        console.error("Error: No se encontró el usuario logueado.");
        return;
    }

    const checkboxContainer = document.getElementById("aficionesCheckboxContainer");
    const guardarAficionesButton = document.getElementById("guardarAficionesButton");

    if (!checkboxContainer || !guardarAficionesButton) {
        console.error("Elementos necesarios no encontrados en el DOM.");
        return;
    }

    checkboxContainer.innerHTML = ""; // Clear any existing checkboxes

    Promise.all([
        obtenerAficionesDesdeIndexedDB(),
        obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario)
    ])
    .then(([todasAficiones, aficionesUsuario]) => {
        const idsAficionesUsuario = aficionesUsuario.map(aficion => aficion.idAficion);
        const aficionesDisponibles = todasAficiones.filter(aficion => !idsAficionesUsuario.includes(aficion.idAficion));

        if (aficionesDisponibles.length === 0) {
            checkboxContainer.innerHTML = "<p>No hay aficiones disponibles para añadir.</p>";
            guardarAficionesButton.style.display = "none";
            return;
        }

        crearCheckboxes(aficionesDisponibles, checkboxContainer);
        guardarAficionesButton.style.display = "block";

        guardarAficionesButton.removeEventListener("click", guardarAficionesEventHandler); // Remove any previous handlers
        guardarAficionesButton.addEventListener("click", guardarAficionesEventHandler);

        function guardarAficionesEventHandler() {
            const checkboxes = checkboxContainer.querySelectorAll("input[type='checkbox']");
            const seleccionadas = Array.from(checkboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => Number(checkbox.value)); // Ensure values are numbers

            if (seleccionadas.length === 0) {
                alert("No has seleccionado ninguna afición.");
                return;
            }

            openIndexedDB().then(db => {
                const transaction = db.transaction("usuario_aficion", "readwrite");
                const store = transaction.objectStore("usuario_aficion");

                const existingRequest = store.getAll();
                existingRequest.onsuccess = () => {
                    const existingAficiones = existingRequest.result.filter(item => item.email === emailUsuario);
                    const existingIds = existingAficiones.map(item => Number(item.idAficion));

                    const nuevasAficiones = seleccionadas.filter(idAficion => !existingIds.includes(idAficion));

                    if (nuevasAficiones.length === 0) {
                        alert("Todas las aficiones seleccionadas ya están registradas.");
                        return;
                    }

                    nuevasAficiones.forEach(idAficion => {
                        store.put({ email: emailUsuario, idAficion });
                    });

                    transaction.oncomplete = () => {
                        alert("¡Aficiones añadidas exitosamente!");
                        cargarAficiones(obtenerAficionesUsuarioDesdeIndexedDB, document.getElementById("main"));
                    };

                    transaction.onerror = event => {
                        console.error("Error al guardar aficiones en IndexedDB:", event.target.error);
                    };
                };

                existingRequest.onerror = event => {
                    console.error("Error al obtener las aficiones existentes del usuario:", event.target.error);
                };
            }).catch(error => {
                console.error("Error al abrir IndexedDB:", error);
            });
        }

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
