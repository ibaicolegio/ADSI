// Este script se carga después del primero

console.log("El segundo script se ha cargado correctamente.");

// Cambiar el contenido de un elemento con id 'content'
document.addEventListener("DOMContentLoaded", function () {
  const content = document.getElementById("content");
  if (content) {
    content.innerHTML = "<p>El contenido ha sido actualizado por el segundo script.</p>";
  }
});
