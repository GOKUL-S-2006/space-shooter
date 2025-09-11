import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "gsap";
import { loadSpaceship } from "./loadSpaceship.js";

let scene, camera, renderer, composer, stars, spaceship;

function init() {
  // === SCENE ===
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // === CAMERA ===
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  // Start behind & above
  camera.position.set(0, 5, 30);
  camera.lookAt(0, 0, 0);

  // === RENDERER ===
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // === POSTPROCESSING ===
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    )
  );

  // === LIGHTING ===
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  // === STARS ===
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    positions.push((Math.random() - 0.5) * 2000);
    positions.push((Math.random() - 0.5) * 2000);
    positions.push(Math.random() * -2000);
  }
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // === START BUTTON ===
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      console.log("🎬 Start button clicked!");
      gsap.to(camera.position, {
        x: 0,
        y: 3,
        z: 20, // keep behind the ship, not inside
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          console.log("🚀 Loading spaceship...");
          loadSpaceship(scene, camera, (ship) => {
            spaceship = ship;
            // Extra scale boost here if needed
            spaceship.scale.multiplyScalar(1.5);
          });
        },
      });

      gsap.to(startBtn, { opacity: 0, scale: 0.5, duration: 1 });
    });
  }

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Move stars backward
  stars.position.z += 5;
  if (stars.position.z > 1000) stars.position.z = 0;

  // Keep spaceship steady
  if (spaceship) {
    spaceship.rotation.set(0, 0, 0);
    spaceship.position.set(0, -1 + Math.sin(Date.now() * 0.002) * 0.2, 0);

    // Camera follows closer to ship
    camera.position.lerp(
      new THREE.Vector3(
        spaceship.position.x,
        spaceship.position.y + 3,
        spaceship.position.z + 12 // closer POV
      ),
      0.05 // smoothness
    );

    // Look slightly ahead, not just at ship
    const lookAtTarget = spaceship.position.clone();
    lookAtTarget.z -= 20;
    camera.lookAt(lookAtTarget);
  }

  composer.render();
}

init();
animate();
