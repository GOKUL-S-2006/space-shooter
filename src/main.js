import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "gsap";
import { loadSpaceship } from "./loadSpaceship.js";
import { startGame, updateGame, resetGame } from "./game.js";

let scene, camera, renderer, composer, stars, spaceship;
let gameState = "menu"; // 'menu', 'playing', 'gameover'

// UI Elements
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
  camera.position.set(0, 0, 10); // Start camera at menu position

  // === RENDERER ===
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // === POSTPROCESSING ===
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2, // strength
    0.4, // radius
    0.85 // threshold
  );
  composer.addPass(bloomPass);

  // === LIGHTING ===
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);
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
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // === LOAD SPACESHIP ===
  // Load the ship immediately for the menu
  loadSpaceship(scene, camera, (ship) => {
    spaceship = ship;
  });

  // === EVENT LISTENERS ===
  startBtn.addEventListener("click", onStartClick);
  restartBtn.addEventListener("click", onRestartClick);
  window.addEventListener("resize", onWindowResize);
}

function onStartClick() {
  console.log("🎬 Start button clicked!");
  gameState = "playing";

  // Hide button
  gsap.to(startBtn, { opacity: 0, scale: 0.5, duration: 1, onComplete: () => startBtn.classList.add('hidden') });

  // Show score
  scoreEl.style.opacity = 1;

  // Start the game logic
  startGame(spaceship, scene, camera);
}

function onRestartClick() {
  console.log("🔄 Restarting game...");
  gameOverEl.classList.add("hidden");
  
  // Reset game state and UI
  resetGame(spaceship, scene);
  scoreEl.innerText = "Score: 0";
  scoreEl.style.opacity = 1;
  
  gameState = "playing";
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Move stars to simulate forward motion
  stars.position.z += 2; // Slower star speed
  if (stars.position.z > 1000) stars.position.z = 0;

  if (gameState === "menu" && spaceship) {
    // Menu animation: rotate and hover
    spaceship.rotation.y += 0.005;
    spaceship.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.2;
  }
  
  if (gameState === "playing") {
    // Delegate updates to the game module
    const isGameOver = updateGame();
    if (isGameOver) {
      gameState = "gameover";
      // Show game over screen
      gameOverEl.classList.remove("hidden");
      scoreEl.style.opacity = 0; // Hide score
    }
  }

  composer.render();
}

init();
animate();