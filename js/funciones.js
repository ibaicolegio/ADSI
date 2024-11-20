export function cargarLikes() {
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

// Configurar el formulario de inicio de sesión
export function login() {
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

export function buscar() {
    // Obtener el formulario de búsqueda y el contenedor de resultados
    const searchForm = document.getElementById("searchForm");
    const searchResultsContainer = document.getElementById("searchResultsContainer");

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

            // Recuperar la lista de usuarios desde sessionStorage
            const users = JSON.parse(sessionStorage.getItem("usuarios")) || [];
            
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
                       generoValue = ["H","M"];
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
                            <div class="card-body">
                                <h5 class="card-title">${user.nombre}</h5>
                                <p class="card-text">Edad: ${user.edad}</p>
                                <p class="card-text">Ciudad: ${user.ciudad}</p>
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