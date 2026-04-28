import { animate, svg } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

const motionPathSection = document.querySelector("#svg-createmotionpath");

if (motionPathSection) {
  const path = motionPathSection.querySelector("#suzuka");
  const car = motionPathSection.querySelector(".motion-path-car");

  if (path && car) {
    animate(car, {
      ease: "linear",
      duration: 5000,
      loop: true,
      ...svg.createMotionPath(path),
    });

    animate(svg.createDrawable(path), {
      draw: "0 1",
      ease: "linear",
      duration: 5000,
      loop: true,
    });
  }
}
