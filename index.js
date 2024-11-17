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
      const links = document.querySelectorAll("header a");
      const content = document.getElementById("main");

      links.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault(); // Evitar que el enlace recargue la página
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
    })
    .catch((error) => {
      console.error("Error al cargar el header, main o footer:", error.message);
    });
});

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