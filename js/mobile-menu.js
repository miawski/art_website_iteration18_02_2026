document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("mobileBurger");
  const menu = document.getElementById("mobileMenu");

  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    menu.classList.toggle("mobile_menu_open");
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
  });
});
