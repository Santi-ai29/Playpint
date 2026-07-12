(() => {
  const root = document.querySelector(".animated-game-background");
  const canvas = document.querySelector("#embersCanvas");

  if (!root || !(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    return;
  }

  const colors = ["#ffb31a", "#ff8a00", "#ff4d16", "#ffd05a"];
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = reduceMotionQuery.matches;
  let particles = [];
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let animationFrame = 0;
  let previousTime = 0;
  let running = false;

  const resizeObserver =
    "ResizeObserver" in window ? new ResizeObserver(() => resizeCanvas()) : null;

  if (resizeObserver) {
    resizeObserver.observe(root);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  root.classList.toggle("is-reduced", reduceMotion);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", cleanup, { once: true });

  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof reduceMotionQuery.addListener === "function") {
    reduceMotionQuery.addListener(handleMotionPreferenceChange);
  }

  resizeCanvas();
  start();

  function resizeCanvas() {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    pixelRatio = Math.min(window.devicePixelRatio || 1, reduceMotion ? 1.25 : 1.75);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    particles = createParticles();
    drawFrame(0);
  }

  function createParticles() {
    return Array.from({ length: getParticleCount() }, () => createParticle(true));
  }

  function getParticleCount() {
    const area = width * height;

    if (width <= 430) {
      return clamp(Math.round(area / 12500), 20, 32);
    }

    if (width <= 768) {
      return clamp(Math.round(area / 15000), 28, 42);
    }

    return clamp(Math.round(area / 23000), 40, 55);
  }

  function createParticle(initial) {
    const large = Math.random() > 0.88;
    const duration = randomBetween(14, 27);

    return {
      x: randomBetween(width * 0.06, width * 0.94),
      y: initial ? randomBetween(height * 0.1, height * 1.05) : randomBetween(height * 0.94, height * 1.12),
      size: large ? randomBetween(2, 3) : randomBetween(0.8, 1.7),
      alpha: large ? randomBetween(0.42, 0.72) : randomBetween(0.18, 0.46),
      color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
      drift: randomBetween(-4, 4),
      phase: randomBetween(0, Math.PI * 2),
      sway: randomBetween(4, 14),
      swaySpeed: randomBetween(0.38, 0.72),
      velocity: randomBetween(4, 11),
      life: initial ? randomBetween(0, duration) : 0,
      duration,
      twinkle: randomBetween(0.72, 1.18),
    };
  }

  function start() {
    stop();
    root.classList.toggle("is-reduced", reduceMotion);
    drawFrame(0);

    if (reduceMotion || document.visibilityState === "hidden") {
      return;
    }

    running = true;
    previousTime = 0;
    animationFrame = window.requestAnimationFrame(animate);
  }

  function stop() {
    running = false;

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function animate(time) {
    if (!running) {
      return;
    }

    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0.016;
    previousTime = time;
    drawFrame(delta);
    animationFrame = window.requestAnimationFrame(animate);
  }

  function drawFrame(delta) {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";

    for (const particle of particles) {
      if (!reduceMotion) {
        particle.life += delta;
        particle.y -= particle.velocity * delta;
        particle.x += particle.drift * delta;

        if (particle.y < -12 || particle.life >= particle.duration) {
          Object.assign(particle, createParticle(false));
        }
      }

      drawParticle(particle);
    }

    context.globalAlpha = 1;
    context.shadowBlur = 0;
    context.globalCompositeOperation = "source-over";
  }

  function drawParticle(particle) {
    const progress = clamp(particle.life / particle.duration, 0, 1);
    const fadeIn = clamp(progress / 0.16, 0, 1);
    const fadeOut = clamp((1 - progress) / 0.26, 0, 1);
    const flicker = reduceMotion ? 0.72 : 0.72 + Math.sin((particle.life + particle.phase) * particle.twinkle) * 0.16;
    const alpha = particle.alpha * Math.min(fadeIn, fadeOut) * flicker * (reduceMotion ? 0.42 : 1);
    const x = particle.x + Math.sin(particle.life * particle.swaySpeed + particle.phase) * particle.sway;

    if (alpha <= 0.01) {
      return;
    }

    context.globalAlpha = alpha;
    context.fillStyle = particle.color;

    if (particle.size > 1.6) {
      context.shadowColor = particle.color;
      context.shadowBlur = 5;
    } else {
      context.shadowBlur = 0;
    }

    context.beginPath();
    context.arc(x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      stop();
      return;
    }

    start();
  }

  function handleMotionPreferenceChange(event) {
    reduceMotion = event.matches;
    start();
  }

  function cleanup() {
    stop();
    resizeObserver?.disconnect();
    window.removeEventListener("resize", resizeCanvas);
    document.removeEventListener("visibilitychange", handleVisibilityChange);

    if (typeof reduceMotionQuery.removeEventListener === "function") {
      reduceMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
    } else if (typeof reduceMotionQuery.removeListener === "function") {
      reduceMotionQuery.removeListener(handleMotionPreferenceChange);
    }
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
