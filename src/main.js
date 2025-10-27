import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; 
import { gsap } from "gsap";
import { loadSpaceship } from "./loadSpaceship.js";
import { startGame, updateGame, resetGame } from "./game.js";
import { initObstacles } from './obstacles.js';

let scene, camera, renderer, composer, stars, spaceship, earthModel; 
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
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('game-canvas') }); 
  renderer.setSize(window.innerWidth, window.innerHeight);

  initObstacles();

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
  loadSpaceship(scene, camera, (ship) => {
    spaceship = ship;
  });

  // === LOAD EARTH === //
  const loader = new GLTFLoader();
  loader.load(
    '/models/earth.glb', // This path is now correct because it's in /public
    function (gltf) {
      earthModel = gltf.scene;

      // Position it on the left side, slightly down, and back
      earthModel.position.set(8, -2, -5); // Using your last position
      //earthModel.position.set(7, -1.5, -4);


      // Scale it up so it looks like a planet
      earthModel.scale.set(2.5, 2.5, 2.5); 
      scene.add(earthModel);
      console.log("🌍 Earth loaded!");
    },
    undefined, 
    function (error) {
      console.error('An error happened while loading the earth:', error);
    }
  );

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

  // <--- NEW: Animate the Earth disappearing
  if (earthModel) {
    // We scale it to a tiny number (not 0) to avoid issues
    gsap.to(earthModel.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1 });
  }

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

  // <--- NEW: Make sure Earth stays hidden on restart
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

  // <--- MODIFIED: Only rotate the earth if we are in the menu
  if (earthModel && gameState === "menu") {
    earthModel.rotation.y += 0.001; // Adjust speed as you like
  }

  // Move stars to simulate forward motion
  stars.position.z += 2; 
  if (stars.position.z > 1000) stars.position.z = 0;

  if (gameState === "menu" && spaceship) {
    // Menu animation: rotate and hover
    spaceship.rotation.y += 0.005;
    spaceship.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.2;
    spaceship.position.x = 0; // Keep it centered
    spaceship.position.z = 0; // Keep it at the origin
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
