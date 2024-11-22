// Función para abrir o crear la base de datos IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('VitoMaite09', 1);  // Abre o crea la base de datos

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            // Crear almacenes para cada tipo de datos
            if (!db.objectStoreNames.contains('usuarios')) {
                db.createObjectStore('usuarios', { keyPath: 'email' });
            }
            if (!db.objectStoreNames.contains('meGusta')) {
                db.createObjectStore('meGusta', { keyPath: ['email1', 'email2'] });  // Usando 'email1' como clave primaria
            }
            if (!db.objectStoreNames.contains('aficiones')) {
                db.createObjectStore('aficiones', { keyPath: 'idAficion' });
            }
            if (!db.objectStoreNames.contains('usuario_aficion')) {
                db.createObjectStore('usuario_aficion', { keyPath: ['email', 'idAficion'] });
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

// Función para obtener los usuarios desde IndexedDB
export function obtenerUsuariosDesdeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("VitoMaite09", 1);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction("usuarios", "readonly");
            const objectStore = transaction.objectStore("usuarios");
            const allUsersRequest = objectStore.getAll(); // Obtener todos los usuarios

            allUsersRequest.onsuccess = function() {
                resolve(allUsersRequest.result); // Resolver con todos los usuarios
            };

            allUsersRequest.onerror = function(event) {
                reject("Error al obtener los usuarios: " + event.target.error);
            };
        };

        request.onerror = function(event) {
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

            // Obtener las aficiones del usuario por su email
            const userAficionesRequest = usuarioAficionStore.getAll();
            userAficionesRequest.onsuccess = function () {
                const allUserAficiones = userAficionesRequest.result;
                console.log("Todos los registros en usuario_aficion:", allUserAficiones);

                // Filtrar los registros asociados al usuario
                const userAficiones = allUserAficiones.filter((item) => {
                    const emailBD = item.email?.trim().toLowerCase();
                    const emailFiltrado = emailUsuario?.trim().toLowerCase();
                    console.log(`Comparando "${emailBD}" con "${emailFiltrado}"`);
                    return emailBD === emailFiltrado;
                });

                console.log(`Registros filtrados para ${emailUsuario}:`, userAficiones);

                if (userAficiones.length > 0) {
                    // Convertir IDs de aficiones a cadenas
                    const aficionIds = Array.isArray(userAficiones[0].idAficion)
                        ? userAficiones[0].idAficion.map(String)
                        : [String(userAficiones[0].idAficion)];
                    console.log("IDs de aficiones del usuario:", aficionIds);

                    // Obtener todas las aficiones
                    const aficionesRequest = aficionesStore.getAll();
                    aficionesRequest.onsuccess = function () {
                        const allAficiones = aficionesRequest.result;
                        console.log("Todas las aficiones en el almacén:", allAficiones);

                        // Filtrar las aficiones asociadas al usuario
                        const aficiones = allAficiones.filter((aficion) =>
                            aficionIds.includes(String(aficion.idAficion))
                        );
                        console.log("Aficiones del usuario con nombres:", aficiones);

                        // Devolver aficiones con nombres
                        const aficionesConNombre = aficiones.map((aficion) => ({
                            idAficion: aficion.idAficion,
                            nombre: aficion.nombreAficion || "Afición sin nombre"
                        }));
                        resolve(aficionesConNombre);
                    };

                    aficionesRequest.onerror = function (event) {
                        reject("Error al obtener las aficiones: " + event.target.error);
                    };
                } else {
                    console.log(`No se encontraron aficiones para el usuario ${emailUsuario}`);
                    resolve([]);
                }
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

export function obtenerAficionesDesdeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("VitoMaite09", 1);

        request.onsuccess = function(event) {
            const db = event.target.result;
            console.log("Base de datos abierta con éxito:", db);  // Verificar que la base de datos se abrió correctamente

            const transaction = db.transaction("aficiones", "readonly");  // Accede al almacén "aficiones"
            const objectStore = transaction.objectStore("aficiones");
            const allAficionesRequest = objectStore.getAll();  // Recupera todas las aficiones

            allAficionesRequest.onsuccess = function() {
                console.log("Aficiones recuperadas:", allAficionesRequest.result);  // Verificar si se recuperan las aficiones
                resolve(allAficionesRequest.result); // Devuelve todas las aficiones
            };

            allAficionesRequest.onerror = function(event) {
                console.error("Error al obtener las aficiones:", event.target.error);  // Verificar si ocurre un error
                reject("Error al obtener las aficiones: " + event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error("Error al abrir IndexedDB:", event.target.error);  // Verificar si ocurre un error al abrir la base de datos
            reject("Error al abrir IndexedDB: " + event.target.error);
        };
    });
}


