import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { loadSpaceship } from "./loadSpaceship.js";
import { startGame, updateGame, resetGame } from "./game.js";
import { initObstacles } from "./obstacles.js";

let scene, camera, renderer, composer, stars, spaceship, earthModel;
let gameState = "menu";
let menuMusic;

// --- UI Elements ---
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

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
  camera.position.set(0, 0, 10);

  // === RENDERER ===
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("game-canvas"),
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  initObstacles();

  // === POSTPROCESSING ===
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,
    0.4,
    0.85
  );
  composer.addPass(bloomPass);

  // === LIGHTS ===
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // === STARS ===
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    positions.push((Math.random() - 0.5) * 2000);
    positions.push((Math.random() - 0.5) * 2000);
    positions.push(Math.random() * -2000);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // === LOAD SPACESHIP ===
  loadSpaceship(scene, camera, (ship) => {
    spaceship = ship;
  });

  // === LOAD EARTH ===
  const loader = new GLTFLoader();
  loader.load(
    "/models/earth.glb",
    function (gltf) {
      earthModel = gltf.scene;
      earthModel.position.set(8, -2, -5);
      earthModel.scale.set(2.5, 2.5, 2.5);
      scene.add(earthModel);
      console.log("🌍 Earth loaded!");
    },
    undefined,
    function (error) {
      console.error("An error happened while loading the earth:", error);
    }
  );

  // === LOAD MENU MUSIC ===
  menuMusic = new Audio("/models/interstellar_theme.mp3");
  menuMusic.loop = true;
  menuMusic.volume = 0.6;

  console.log("🎵 Menu music initialized but not playing yet.");

  // === BUTTON EVENTS ===
  startBtn.addEventListener("click", onStartClick);
  restartBtn.addEventListener("click", onRestartClick);
  window.addEventListener("resize", onWindowResize);
}

function onStartClick() {
  console.log("🎬 Start button clicked!");

  // Try playing music when clicked if not already
  if (menuMusic && menuMusic.paused) {
    menuMusic.play().then(() => {
      console.log("🎶 Interstellar theme playing successfully!");
    }).catch(err => {
      console.warn("⚠️ Audio play blocked or failed:", err);
    });
  }

  gameState = "playing";

  // Fade out the menu music
  if (menuMusic && !menuMusic.paused) {
    gsap.to(menuMusic, {
      volume: 0,
      duration: 2,
      onComplete: () => {
        menuMusic.pause();
        menuMusic.currentTime = 0;
        console.log("🎧 Menu music stopped.");
      },
    });
  }

  // Hide Start Button
  gsap.to(startBtn, {
    opacity: 0,
    scale: 0.5,
    duration: 1,
    onComplete: () => startBtn.classList.add("hidden"),
  });

  // Hide Earth
  if (earthModel) {
    gsap.to(earthModel.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1 });
  }

  scoreEl.style.opacity = 1;
  startGame(spaceship, scene, camera);
}

function onRestartClick() {
  console.log("🔄 Restarting game...");
  gameOverEl.classList.add("hidden");
  resetGame(spaceship, scene);
  scoreEl.innerText = "Score: 0";
  scoreEl.style.opacity = 1;
  gameState = "playing";

  if (earthModel) {
    earthModel.scale.set(0.01, 0.01, 0.01);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate Earth only in menu
  if (earthModel && gameState === "menu") {
    earthModel.rotation.y += 0.001;
  }

  // Move stars
  stars.position.z += 2;
  if (stars.position.z > 1000) stars.position.z = 0;

  // Menu spaceship hover
  if (gameState === "menu" && spaceship) {
    spaceship.rotation.y += 0.005;
    spaceship.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.2;
  }

  // Playing state
  if (gameState === "playing") {
    const isGameOver = updateGame();
    if (isGameOver) {
      gameState = "gameover";
      gameOverEl.classList.remove("hidden");
      scoreEl.style.opacity = 0;
    }
  }

  composer.render();
}

init();
console.log("🎵 Testing audio from /sound_effects...");

document.body.addEventListener("click", () => {
  const testSound = new Audio("/sound_effects/interstellar_theme.mp3");
  testSound.loop = true;
  testSound.play()
    .then(() => console.log("✅ Interstellar theme playing!"))
    .catch(err => console.error("⚠️ Audio play error:", err));
});

animate();
