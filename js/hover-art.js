document.addEventListener("DOMContentLoaded", () => {
  const hoverArts = document.querySelectorAll(".hover_art");
  if (!hoverArts.length) return;

  const isTouchLikeDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (!isTouchLikeDevice) return;

  if (typeof IntersectionObserver !== "function") {
    hoverArts.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const hoverObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "-35% 0px -35% 0px",
    },
  );

  hoverArts.forEach((item) => hoverObserver.observe(item));
});
