const awabSekhmetStack = document.querySelector(".awab_sekhmet_stack");
const awabSekhmetEyes = document.querySelector(".awab_sekhmet_eyes");

if (awabSekhmetStack && awabSekhmetEyes) {
  const maxMoveX = 4;
  const maxMoveY = 1.9;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function moveEyes(event) {
    const faceBox = awabSekhmetStack.getBoundingClientRect();
    const faceCenterX = faceBox.left + faceBox.width / 2;
    const faceCenterY = faceBox.top + faceBox.height / 2;

    const distanceX = event.clientX - faceCenterX;
    const distanceY = event.clientY - faceCenterY;

    const moveX = clamp((distanceX / faceBox.width) * 12, -maxMoveX, maxMoveX);
    const moveY = clamp((distanceY / faceBox.height) * 10, -maxMoveY, maxMoveY);

    awabSekhmetEyes.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  }

  function resetEyes() {
    awabSekhmetEyes.style.transform = "translate3d(0, 0, 0)";
  }

  document.addEventListener("mousemove", moveEyes);
  window.addEventListener("blur", resetEyes);
}
