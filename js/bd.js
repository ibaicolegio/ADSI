/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// prueba indexedBD

// Función para abrir o crear la base de datos IndexedDB

export function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MiBaseDeDatos', 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('usuarios')) {
                // Crear el almacén "usuarios" con "email" como clave primaria
                db.createObjectStore('usuarios', { keyPath: 'email' });
                // Crear el almacén "aficiones" con "id" como clave primaria
                db.createObjectStore('usuarios', { keyPath: 'id' });
                db.createObjectStore('meGusta', { keyPath: 'id'});
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(`Error al abrir IndexedDB: ${event.target.error}`);
        };
    });
}



// Función para insertar datos en un almacén
export function insertarEnIndexedDB(db, storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);

        // Insertar cada registro en el almacén
        data.forEach((item) => {
            objectStore.put(item); // Usa put para insertar o actualizar registros
        });

        transaction.oncomplete = function () {
            resolve();
        };

        transaction.onerror = function (event) {
            reject(`Error al insertar en ${storeName}: ${event.target.error}`);
        };
    });
}





