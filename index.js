document.addEventListener("DOMContentLoaded", function () {
  const cache = {}; // Objeto para almacenar las páginas cargadas

  // Verificar si el usuario está autenticado
  const isAuthenticated = sessionStorage.getItem("userLoggedIn");

  if (!isAuthenticated) {
    // Mostrar el login con su propio header
    loadLoginPage();
  } else {
    // Mostrar el contenido principal con el header general
    loadMainPage();
  }

  // Función para cargar la página de login con su propio header
  function loadLoginPage() {
    Promise.all([
      loadHTML("views/login-header.html", "header"),
      loadHTML("views/login.html", "main"),
      loadHTML("views/footer.html", "footer"),
    ]).then(() => {
      const loginForm = document.getElementById("loginForm");
      const loginLinks = document.querySelectorAll("header .nav-link");
      const content = document.getElementById("main");

      // Manejar navegación en el header de login
      loginLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          const view = link.getAttribute("data-view");

          if (view) {
            if (cache[view]) {
              content.innerHTML = cache[view];
            } else {
              fetch(view)
                .then((response) => {
                  if (!response.ok) throw new Error("Página no encontrada.");
                  return response.text();
                })
                .then((html) => {
                  cache[view] = html;
                  content.innerHTML = html;
                })
                .catch((error) => {
                  content.innerHTML = `<p>Error: ${error.message}</p>`;
                });
            }
          }
        });
      });

      // Manejar el envío del formulario de login
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Validación simple
        if (username === "admin" && password === "1234") {
          // Guardar el usuario en sessionStorage
          sessionStorage.setItem("userLoggedIn", username);
          alert("Login exitoso");
          loadMainPage(); // Cambiar a la página principal
        } else {
          alert("Usuario o contraseña incorrectos.");
        }
      });
    });
  }

  // Función para cargar la página principal con el header general
  function loadMainPage() {
    Promise.all([
      loadHTML("views/header.html", "header"),
      loadHTML("views/inicio.html", "main"),
      loadHTML("views/footer.html", "footer"),
    ])
      .then(() => {
        const links = document.querySelectorAll("header .nav-link");
        const content = document.getElementById("main");

        // Agregar funcionalidad al botón de logout
        const logoutButton = document.getElementById("logoutButton");
        if (logoutButton) {
          logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("userLoggedIn"); // Eliminar el usuario de sessionStorage
            alert("Has cerrado sesión.");
            location.reload(); // Recargar para redirigir al login
          });
        }

        // Manejar navegación entre páginas
        links.forEach((link) => {
          link.addEventListener("click", function (event) {
            event.preventDefault();

            // Gestionar clases de énfasis
            links.forEach((l) => l.classList.remove("link-body-emphasis"));
            links.forEach((l) => l.classList.add("link-secondary"));

            link.classList.add("link-body-emphasis");
            link.classList.remove("link-secondary");

            const view = link.getAttribute("data-view");

            if (view) {
              if (cache[view]) {
                content.innerHTML = cache[view];
              } else {
                fetch(view)
                  .then((response) => {
                    if (!response.ok) throw new Error("Página no encontrada.");
                    return response.text();
                  })
                  .then((html) => {
                    cache[view] = html;
                    content.innerHTML = html;
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
  }
});

// Función para cargar un archivo HTML en un elemento
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