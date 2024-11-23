// Función para abrir o crear la base de datos IndexedDB
export function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('VitoMaite09', 1);  // Abre o crea la base de datos

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            // Crear almacenes para cada tipo de datos
            if (!db.objectStoreNames.contains('usuarios')) {
                db.createObjectStore('usuarios', {keyPath: 'email'});
            }
            if (!db.objectStoreNames.contains('meGusta')) {
                db.createObjectStore('meGusta', {keyPath: ['email1', 'email2']});  // Usando 'email1' como clave primaria
            }
            if (!db.objectStoreNames.contains('aficiones')) {
                db.createObjectStore('aficiones', {keyPath: 'idAficion'});
            }
            if (!db.objectStoreNames.contains('usuario_aficion')) {
                db.createObjectStore('usuario_aficion', {keyPath: ['email', 'idAficion']});
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);  // Resuelve la promesa con la base de datos
        };

        request.onerror = function (event) {
            reject(`Error al abrir IndexedDB: ${event.target.error}`);
        };
    });
}

// Función para insertar los datos en IndexedDB
function insertarEnIndexedDB(db, storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);

        // Insertar cada registro en el almacén
        data.forEach((item) => {
            objectStore.put(item);  // Usamos put para insertar o actualizar registros
        });

        transaction.oncomplete = function () {
            resolve();
        };

        transaction.onerror = function (event) {
            reject(`Error al insertar en la base de datos ${storeName}: ${event.target.error}`);
        };
    });
}

// Función para cargar el archivo JSON
function cargarJSONDesdeArchivo(url) {
    return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo JSON: ${url}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error al cargar el archivo JSON:', error);
                throw error;
            });
}

// Función para cargar y almacenar todos los datos en IndexedDB
export function cargarYAlmacenarDatos() {
    // Rutas de los archivos JSON
    const archivosJSON = {
        usuarios: './json/usuarios.json',
        meGusta: './json/meGusta.json',
        aficiones: './json/aficiones.json',
        usuario_aficion: './json/usuario_aficion.json'
    };

    // Cargar todos los archivos JSON
    Promise.all([
        cargarJSONDesdeArchivo(archivosJSON.usuarios),
        cargarJSONDesdeArchivo(archivosJSON.meGusta),
        cargarJSONDesdeArchivo(archivosJSON.aficiones),
        cargarJSONDesdeArchivo(archivosJSON.usuario_aficion)
    ])
            .then(([usuariosData, meGustaData, aficionesData, usuario_aficionData]) => {
                // Abre la base de datos y almacena los datos
                openIndexedDB().then((db) => {
                    // Almacenar los datos en sus respectivos almacenes
                    Promise.all([
                        insertarEnIndexedDB(db, 'usuarios', usuariosData),
                        insertarEnIndexedDB(db, 'meGusta', meGustaData),
                        insertarEnIndexedDB(db, 'aficiones', aficionesData),
                        insertarEnIndexedDB(db, 'usuario_aficion', usuario_aficionData)
                    ])
                            .then(() => {
                                console.log("Todos los datos se insertaron correctamente en IndexedDB");
                            })
                            .catch((error) => {
                                console.error("Error al insertar los datos en IndexedDB:", error);
                            });
                }).catch((error) => {
                    console.error("Error al abrir la base de datos:", error);
                });
            })
            .catch(error => {
                console.error('Error al cargar los archivos JSON:', error);
            });
}

export function obtenerUsuariosDesdeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("VitoMaite09", 1);

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction("usuarios", "readonly");
            const objectStore = transaction.objectStore("usuarios");
            const allUsersRequest = objectStore.getAll(); // Obtener todos los usuarios

            allUsersRequest.onsuccess = function () {
                const usuarios = allUsersRequest.result;

                // Ordenar los usuarios por el campo 'edad'
                usuarios.sort((a, b) => a.edad - b.edad);

                resolve(usuarios); // Resolver con la lista ordenada
            };

            allUsersRequest.onerror = function (event) {
                reject("Error al obtener los usuarios: " + event.target.error);
            };
        };

        request.onerror = function (event) {
            reject("Error al abrir la base de datos IndexedDB: " + event.target.error);
        };
    });
}

// Función para obtener los "me gusta" desde IndexedDB
export function obtenerLikesDesdeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("VitoMaite09", 1);  // Nombre de la base de datos

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction("meGusta", "readonly"); // Accede al almacén "meGusta"
            const objectStore = transaction.objectStore("meGusta");
            const allLikesRequest = objectStore.getAll(); // Recupera todos los "me gusta"

            allLikesRequest.onsuccess = function () {
                resolve(allLikesRequest.result); // Resolución con los "me gusta" encontrados
            };

            allLikesRequest.onerror = function (event) {
                reject("Error al obtener los 'me gusta': " + event.target.error); // Rechaza si ocurre un error
            };
        };

        request.onerror = function (event) {
            reject("Error al abrir la base de datos IndexedDB: " + event.target.error); // Rechaza si hay un error al abrir la base de datos
        };
    });
}

export function obtenerAficionesUsuarioDesdeIndexedDB(emailUsuario) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("VitoMaite09", 1);

        request.onsuccess = function (event) {
            const db = event.target.result;

            const transaction = db.transaction(["usuario_aficion", "aficiones"], "readonly");
            const usuarioAficionStore = transaction.objectStore("usuario_aficion");
            const aficionesStore = transaction.objectStore("aficiones");

            // Obtener todas las asociaciones email-afición
            const userAficionesRequest = usuarioAficionStore.getAll();
            userAficionesRequest.onsuccess = function () {
                const allUserAficiones = userAficionesRequest.result;

                // Filtrar por email del usuario
                const userAficiones = allUserAficiones.filter(
                        (item) =>
                    item.email?.trim().toLowerCase() === emailUsuario?.trim().toLowerCase()
                );

                if (userAficiones.length === 0) {
                    console.log(`No se encontraron aficiones para el usuario ${emailUsuario}`);
                    resolve([]); // Devuelve un array vacío si no hay registros
                    return;
                }

                const aficionIds = userAficiones.map((item) => String(item.idAficion));

                // Obtener todas las aficiones de la base de datos
                const aficionesRequest = aficionesStore.getAll();
                aficionesRequest.onsuccess = function () {
                    const allAficiones = aficionesRequest.result;

                    // Filtrar las aficiones correspondientes a los IDs
                    const aficiones = allAficiones.filter((aficion) =>
                        aficionIds.includes(String(aficion.idAficion))
                    );

                    // Mapear aficiones con sus nombres
                    const aficionesConNombre = aficiones.map((aficion) => ({
                            idAficion: aficion.idAficion,
                            nombre: aficion.nombreAficion || "Afición sin nombre",
                        }));

                    resolve(aficionesConNombre);
                };

                aficionesRequest.onerror = function (event) {
                    reject("Error al obtener las aficiones: " + event.target.error);
                };
            };

            userAficionesRequest.onerror = function (event) {
                reject("Error al obtener las aficiones del usuario: " + event.target.error);
            };
        };

        request.onerror = function (event) {
            reject("Error al abrir IndexedDB: " + event.target.error);
        };
    });
}


// Función para obtener todas las aficiones desde IndexedDB
export function obtenerAficionesDesdeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("VitoMaite09", 1);

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction("aficiones", "readonly");
            const store = transaction.objectStore("aficiones");
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = function () {
                resolve(getAllRequest.result);
            };

            getAllRequest.onerror = function (event) {
                reject("Error al obtener todas las aficiones: " + event.target.error);
            };
        };

        request.onerror = function (event) {
            reject("Error al abrir la base de datos IndexedDB: " + event.target.error);
        };
    });
}

export function añadirAficionesSeleccionadas(db, emailUsuario, aficionesSeleccionadas) {
    // Convertir un array u objeto a string
    const aficionesSeleccionadasString = JSON.stringify(aficionesSeleccionadas);
    console.log(aficionesSeleccionadasString);
    return new Promise((resolve, reject) => {
        console.log(emailUsuario + "----" + aficionesSeleccionadas);
        // Verificar si aficionesSeleccionadas es un array válido y contiene elementos
        if (!Array.isArray(aficionesSeleccionadas) || aficionesSeleccionadas.length === 0) {
            reject("No se han seleccionado aficiones.");
            return;
        }

        // Crear un array de registros con las aficiones seleccionadas
        const registros = aficionesSeleccionadas.map((idAficion) => ({
                email: emailUsuario,
                idAficion: idAficion
            }));

        // Usar la función insertarEnIndexedDB para insertar los registros en la tienda 'usuario_aficion'
        insertarEnIndexedDB(db, 'usuario_aficion', registros)
                .then(() => {
                    resolve("¡Aficiones añadidas exitosamente!");
                })
                .catch((error) => {
                    reject(`Error al guardar aficiones en IndexedDB: ${error}`);
                });
    });
}


