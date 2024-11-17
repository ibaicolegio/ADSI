document.addEventListener("DOMContentLoaded", function () {
  const cache = {}; // Objeto para almacenar las páginas cargadas

  // Primero, cargar el header, main y footer
  Promise.all([
    loadHTML("views/header.html", "header"),
    loadHTML("views/inicio.html", "main"),
    loadHTML("views/footer.html", "footer"),
  ])
    .then(() => {
      // Después de cargar el header y footer, agregar eventos a los enlaces
      const links = document.querySelectorAll("header .nav-link");
      const content = document.getElementById("main");

      links.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault(); // Evitar que el enlace recargue la página

          // Gestionar las clases de énfasis
          links.forEach((l) => l.classList.remove("link-body-emphasis")); // Eliminar clase de énfasis
          links.forEach((l) => l.classList.add("link-secondary")); // Añadir link-secondary a los demás enlaces

          link.classList.add("link-body-emphasis"); // Añadir link-body-emphasis al enlace clickeado
          link.classList.remove("link-secondary"); // Eliminar link-secondary del enlace clickeado

          const view = link.getAttribute("data-view");

          if (view) {
            // Si la página ya está en la caché, usarla
            if (cache[view]) {
              content.innerHTML = cache[view]; // Actualizar el contenido desde la caché
            } else {
              // Si no está en la caché, cargar del servidor
              fetch(view)
                .then((response) => {
                  if (!response.ok) throw new Error("Pagina no encontrada.");
                  return response.text();
                })
                .then((html) => {
                  cache[view] = html; // Guardar en la caché
                  content.innerHTML = html; // Actualizar el contenido del main
                })
                .catch((error) => {
                  content.innerHTML = `<p>Error: ${error.message}</p>`;
                });
            }
          }
        });
      });

      // Después de que todo se haya cargado, cargamos el segundo script
      loadScript('prueba.js').then(() => {
        console.log('El segundo script se ha cargado y ejecutado.');
      });
    })
    .catch((error) => {
      console.error("Error al cargar el header, main o footer:", error.message);
    });
});

// Función para cargar un archivo JavaScript de forma asíncrona
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error('Failed to load script: ' + src));
    document.head.appendChild(script);
  });
}

function loadHTML(file, elementId) {
  return fetch(file)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      return response.text();
    })
    .then((html) => {
      document.getElementById(elementId).innerHTML = html;
    })
    .catch((error) => {
      console.error(`Error loading ${file}: ${error.message}`);
    });
}