const body = document.body;
const menuButton = document.querySelector(".menu-button");
const menuPanel = document.querySelector(".menu-panel");
const menuLinks = document.querySelectorAll(".menu-panel a");
const canvas = document.querySelector(".ambient-canvas");
const context = canvas.getContext("2d");

function setMenuState(isOpen) {
  body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuPanel.setAttribute("aria-hidden", String(!isOpen));
}

menuButton.addEventListener("click", () => {
  setMenuState(!body.classList.contains("menu-open"));
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

const curves = Array.from({ length: 12 }, (_, index) => ({
  offset: index * 0.58,
  amplitude: 42 + (index % 4) * 18,
  drift: 0.000045 + (index % 4) * 0.000018,
  width: 1.05 + (index % 3) * 0.42,
  alpha: 0.075 + (index % 4) * 0.022,
  bend: 0.18 + (index % 5) * 0.035,
}));

let width = 0;
let height = 0;
let deviceScale = 1;

function resizeCanvas() {
  deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * deviceScale);
  canvas.height = Math.floor(height * deviceScale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
}

function draw(time) {
  context.clearRect(0, 0, width, height);
  context.lineCap = "round";
  context.lineJoin = "round";

  curves.forEach((curve, index) => {
    const phase = time * curve.drift + curve.offset;
    const baseY = height * (0.16 + index * 0.06);
    const startX = -width * 0.12;
    const endX = width * 1.12;
    const breathing = 0.72 + Math.sin(phase * 0.72) * 0.22;
    const amplitude = curve.amplitude * breathing;
    const verticalDrift = Math.sin(phase * 0.46 + index) * 18;

    const gradient = context.createLinearGradient(startX, baseY, endX, baseY);
    gradient.addColorStop(0, `rgba(143, 210, 189, 0)`);
    gradient.addColorStop(0.2, `rgba(143, 210, 189, ${curve.alpha * 0.9})`);
    gradient.addColorStop(0.48, `rgba(244, 122, 32, ${curve.alpha * 0.7})`);
    gradient.addColorStop(0.78, `rgba(215, 181, 109, ${curve.alpha * 0.78})`);
    gradient.addColorStop(1, `rgba(143, 210, 189, 0)`);

    context.strokeStyle = gradient;
    context.lineWidth = curve.width;
    context.beginPath();

    const segments = 7;
    const step = (endX - startX) / segments;
    let previousX = startX;
    let previousY = baseY + verticalDrift + Math.sin(phase - 1.2) * amplitude;
    context.moveTo(previousX, previousY);

    for (let segment = 1; segment <= segments; segment += 1) {
      const x = startX + step * segment;
      const wave = Math.sin(phase + segment * 0.82 + index * 0.11);
      const secondaryWave = Math.sin(phase * 0.64 + segment * 1.28);
      const y = baseY + verticalDrift + wave * amplitude + secondaryWave * amplitude * 0.28;
      const controlPull = step * (0.42 + curve.bend);

      context.bezierCurveTo(
        previousX + controlPull,
        previousY,
        x - controlPull,
        y,
        x,
        y
      );

      previousX = x;
      previousY = y;
    }

    context.stroke();
  });

  requestAnimationFrame(draw);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
requestAnimationFrame(draw);
