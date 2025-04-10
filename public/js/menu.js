document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".dropdown");
  
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        menu.classList.toggle("hidden");
      });
    }
  });
  