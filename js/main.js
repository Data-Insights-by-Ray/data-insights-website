(() => {
  initRobotIntro();
  prefetchInternalPages();

  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      siteNav.classList.toggle("open");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
      });
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const submitButton = contactForm.querySelector("button[type='submit']");
    const endpoint = "https://formsubmit.co/ajax/rodgersmhlongo23@gmail.com";

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const phone = contactForm.phone.value.trim();
      const service = contactForm.service.value;
      const message = contactForm.message.value.trim();

      let status = contactForm.querySelector(".form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        contactForm.appendChild(status);
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      status.textContent = "";
      status.classList.remove("error");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            service,
            message,
            _subject: `[Booking Request] ${service || "General"} - ${name}`,
            _captcha: "false"
          })
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        status.textContent = "Request sent successfully. Ray will reply manually.";
        contactForm.reset();
      } catch (error) {
        status.textContent = "Could not send from the site right now. Please email rodgersmhlongo23@gmail.com directly.";
        status.classList.add("error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Email Request";
        }
      }
    });
  }

  function initRobotIntro() {
    const isHomePage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.endsWith("/index.html") ||
      window.location.pathname === "";
    if (!isHomePage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.sessionStorage.getItem("robotIntroSeen") === "1") return;

    const intro = document.createElement("div");
    intro.className = "robot-intro";
    intro.innerHTML = `
      <div class="robot-intro-inner">
        <div class="robot-stage" aria-hidden="true">
          <canvas class="robot-canvas"></canvas>
          <div class="robot-hud-ring ring-a"></div>
          <div class="robot-hud-ring ring-b"></div>
          <div class="robot-fallback">
            <div class="robot">
              <div class="robot-head"><span></span><span></span></div>
              <div class="robot-body"></div>
              <div class="robot-shadow"></div>
            </div>
          </div>
        </div>
        <p class="robot-status"><span class="robot-status-dot"></span>AI VISUAL SYSTEM BOOTING</p>
        <p class="robot-copy">Loading Data Intelligence...</p>
        <p class="robot-copy-sub">Preparing an immersive analytics experience</p>
      </div>
    `;

    document.body.classList.add("intro-lock");
    document.body.appendChild(intro);

    let cleanupScene = () => {};
    let introClosed = false;
    const introStart = performance.now();
    const minDisplayMs = 2500;
    const maxDisplayMs = 6200;

    enhanceRobotIntro(intro).then((result) => {
      if (introClosed) {
        if (result && typeof result.cleanup === "function") {
          result.cleanup();
        }
        return;
      }

      if (result && typeof result.cleanup === "function") {
        cleanupScene = result.cleanup;
      }

      if (result && result.ready) {
        intro.dataset.robotReady = "1";
      } else {
        intro.dataset.robotReady = "fallback";
      }
    });

    const closeIntro = () => {
      if (introClosed) return;
      introClosed = true;
      window.sessionStorage.setItem("robotIntroSeen", "1");
      intro.classList.add("is-closing");
      window.setTimeout(() => {
        cleanupScene();
        intro.remove();
        document.body.classList.remove("intro-lock");
      }, 620);
    };

    const waitForReadyAndClose = () => {
      if (introClosed) return;
      const elapsed = performance.now() - introStart;
      const ready = intro.dataset.robotReady === "1" || intro.dataset.robotReady === "fallback";
      if ((ready && elapsed >= minDisplayMs) || elapsed >= maxDisplayMs) {
        closeIntro();
        return;
      }
      window.requestAnimationFrame(waitForReadyAndClose);
    };

    window.requestAnimationFrame(waitForReadyAndClose);
  }

  function prefetchInternalPages() {
    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => a.getAttribute("href"))
      .filter((href) => href && href.endsWith(".html"));
    const uniqueLinks = Array.from(new Set(links)).slice(0, 12);

    const injectPrefetch = () => {
      uniqueLinks.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        document.head.appendChild(link);
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(injectPrefetch, { timeout: 1800 });
    } else {
      window.setTimeout(injectPrefetch, 900);
    }
  }
  async function enhanceRobotIntro(intro) {
    const canvas = intro.querySelector(".robot-canvas");
    const fallback = intro.querySelector(".robot-fallback");
    if (!canvas) {
      return { ready: false, cleanup: () => {} };
    }

    try {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"),
        import("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js")
      ]);

      if (!document.body.contains(intro)) {
        return { ready: false, cleanup: () => {} };
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x050607, 5.5, 13.5);

      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0.6, 1.1, 7.9);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(2.25, 0.045, 16, 120),
        new THREE.MeshBasicMaterial({
          color: 0xa4c4ff,
          transparent: true,
          opacity: 0.82
        })
      );
      halo.rotation.set(Math.PI * 0.5, 0.12, 0);
      halo.position.set(0.05, 1.1, 0);
      scene.add(halo);

      const halo2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.65, 0.03, 14, 90),
        new THREE.MeshBasicMaterial({
          color: 0x95ffd0,
          transparent: true,
          opacity: 0.52
        })
      );
      halo2.rotation.set(Math.PI * 0.52, 0.32, 0.28);
      halo2.position.set(0.05, 1.25, 0);
      scene.add(halo2);

      const particleGeom = new THREE.BufferGeometry();
      const particleCount = 180;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 11;
        positions[i3 + 1] = (Math.random() - 0.5) * 6.8 + 0.6;
        positions[i3 + 2] = (Math.random() - 0.5) * 6.5;
      }
      particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xe4ecff,
        size: 0.034,
        transparent: true,
        opacity: 0.72
      });
      const particles = new THREE.Points(particleGeom, particleMat);
      scene.add(particles);

      const ambient = new THREE.AmbientLight(0xffffff, 0.72);
      const key = new THREE.PointLight(0xbad0ff, 2.2, 26);
      key.position.set(3.7, 4.2, 5.1);
      const rim = new THREE.PointLight(0x97ffd2, 1.5, 21);
      rim.position.set(-3.5, 0.8, 4.2);
      const fill = new THREE.PointLight(0xffffff, 0.85, 13);
      fill.position.set(0.3, -2, 3.4);
      scene.add(ambient, key, rim, fill);

      const robotRig = new THREE.Group();
      scene.add(robotRig);

      const loader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        loader.load("images/models/RobotExpressive.glb", resolve, undefined, reject);
      });

      const robot = gltf.scene;
      robot.scale.set(2.18, 2.18, 2.18);
      robot.position.set(0.16, -2.18, -0.2);
      robot.rotation.y = -0.7;
      robotRig.add(robot);

      const shellMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf3f5fb,
        metalness: 1,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.06
      });
      const darkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4e5669,
        metalness: 0.9,
        roughness: 0.32
      });
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc6dbff,
        metalness: 0.22,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.58
      });

      let meshIndex = 0;
      robot.traverse((child) => {
        if (child.isMesh) {
          meshIndex += 1;
          const pick = meshIndex % 6;
          if (pick === 0) child.material = glassMaterial.clone();
          else if (pick <= 2) child.material = darkMaterial.clone();
          else child.material = shellMaterial.clone();
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      const cableMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x626d84,
        metalness: 0.85,
        roughness: 0.38
      });
      const cableGroup = new THREE.Group();
      cableGroup.position.set(0.1, 0.6, -0.08);
      robotRig.add(cableGroup);
      for (let i = 0; i < 12; i += 1) {
        const x = -0.7 + Math.random() * 1.1;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x * 0.35, 0.72 + Math.random() * 0.25, 0.12 + Math.random() * 0.28),
          new THREE.Vector3(x * 0.26, 0.18 + Math.random() * 0.18, 0.02 + Math.random() * 0.2),
          new THREE.Vector3(x * 0.65, -0.58 + Math.random() * 0.18, -0.04 + Math.random() * 0.16)
        ]);
        const cable = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 24, 0.02 + Math.random() * 0.012, 8, false),
          cableMaterial
        );
        cableGroup.add(cable);
      }

      let mixer = null;
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(robot);
        const clip = THREE.AnimationClip.findByName(gltf.animations, "Idle") || gltf.animations[0];
        mixer.clipAction(clip).play();
      }

      if (fallback) {
        fallback.hidden = true;
      }
      intro.dataset.robotReady = "1";

      let rafId = 0;
      let destroyed = false;
      const clock = new THREE.Clock();

      function onResize() {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      function loop(now) {
        if (destroyed) return;
        const t = now * 0.001;
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        robotRig.position.y = Math.sin(t * 1.8) * 0.05;
        robotRig.rotation.y = -0.02 + Math.sin(t * 0.55) * 0.05;
        halo.rotation.z += 0.0046;
        halo2.rotation.z -= 0.0062;
        particles.rotation.y += 0.0007;
        particles.rotation.x = Math.sin(t * 0.25) * 0.08;
        camera.position.x = 0.6 + Math.sin(t * 0.4) * 0.1;
        camera.lookAt(0, 1.2, 0);

        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(loop);
      }

      window.addEventListener("resize", onResize);
      onResize();
      rafId = window.requestAnimationFrame(loop);

      return {
        ready: true,
        cleanup: () => {
          destroyed = true;
          window.cancelAnimationFrame(rafId);
          window.removeEventListener("resize", onResize);
          scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
              else obj.material.dispose();
            }
          });
          renderer.dispose();
        }
      };
    } catch (error) {
      if (fallback) fallback.hidden = false;
      intro.dataset.robotReady = "fallback";
      return { ready: false, cleanup: () => {} };
    }
  }
})();
