(() => {
  const THEME_KEY = "dib-theme";
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const sidebarNav = document.getElementById("sidebarNav");

  const initialTheme =
    localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  const bgFx = initWebGLBackground();

  function applyTheme(theme, persist = true) {
    body.dataset.theme = theme;
    if (persist) {
      localStorage.setItem(THEME_KEY, theme);
    }
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "Switch to Light" : "Switch to Dark";
    }
    if (bgFx) {
      bgFx.setTheme(theme);
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = body.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  if (mobileNavToggle && sidebarNav) {
    mobileNavToggle.addEventListener("click", () => {
      sidebarNav.classList.toggle("open");
    });
  }

  markActiveNavLink();
  runAnimations();
  applyTheme(initialTheme, false);

  function markActiveNavLink() {
    const links = document.querySelectorAll(".nav-link");
    if (!links.length) return;
    const page = window.location.pathname.split("/").pop() || "index.html";
    links.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === page);
    });
  }

  function runAnimations() {
    if (!window.gsap) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const timeline = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.7 } });
    timeline
      .from(".sidebar", { x: -30, opacity: 0 }, 0)
      .from(".hero", { y: 24, opacity: 0 }, 0.1)
      .from(".bento-card, .workbook-card, .contact-card, .stat-card", { y: 22, opacity: 0, stagger: 0.06 }, 0.15)
      .from(".footer", { y: 18, opacity: 0 }, 0.3);

    const cards = document.querySelectorAll(".bento-card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -6,
          duration: 0.25,
          borderColor: "rgba(109, 93, 252, 0.58)",
          boxShadow: "0 16px 34px rgba(15, 28, 72, 0.35)"
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          duration: 0.25,
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-md)"
        });
      });
    });
  }

  function initWebGLBackground() {
    if (!window.THREE) return null;
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return null;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_theme: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_theme;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        void main() {
          vec2 st = vUv;
          st.x *= u_resolution.x / u_resolution.y;

          float t = u_time;
          float n = noise(st * 3.8 + t * 0.6);
          float wave = sin((st.x + st.y) * 6.5 + t * 2.0) * 0.07;

          vec3 darkA = vec3(0.03, 0.05, 0.12);
          vec3 darkB = vec3(0.16, 0.13, 0.39);
          vec3 lightA = vec3(0.95, 0.97, 1.0);
          vec3 lightB = vec3(0.53, 0.66, 1.0);

          vec3 baseA = mix(darkA, lightA, u_theme);
          vec3 baseB = mix(darkB, lightB, u_theme);

          float blend = smoothstep(0.0, 1.0, st.y + n * 0.2 + wave);
          vec3 color = mix(baseA, baseB, blend);

          float glow = smoothstep(0.95, 0.18, length(vUv - vec2(0.8, 0.2)));
          vec3 glowColor = mix(vec3(0.08, 0.28, 0.7), vec3(0.62, 0.73, 1.0), u_theme);
          color += glowColor * glow * 0.26;

          gl_FragColor = vec4(color, 0.92);
        }
      `
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;

    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }

    function loop(now) {
      uniforms.u_time.value = reduceMotion ? 0 : now * 0.00035;
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(loop);
    }

    window.addEventListener("resize", onResize);
    onResize();
    rafId = window.requestAnimationFrame(loop);

    return {
      setTheme(theme) {
        uniforms.u_theme.value = theme === "light" ? 1 : 0;
      },
      destroy() {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        quad.geometry.dispose();
        material.dispose();
        renderer.dispose();
      }
    };
  }
})();
