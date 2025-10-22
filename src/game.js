import * as THREE from 'three';
import { gsap } from 'gsap';
import { initControls, updateControls } from './controls.js';
import { setupShooting, updateBullets } from './shooting.js';
import { spawnObstacle, updateObstacles } from './obstacles.js';

let ship;
let sceneRef;
let bullets = [];
let obstacles = [];
let score = 0;
let scoreEl;
let obstacleInterval;

// --- Game State Functions ---

/**
 * Starts the game.
 * Called when the "Start" button is clicked.
 */
export function startGame(spaceship, scene, camera) {
  ship = spaceship;
  sceneRef = scene;
  scoreEl = document.getElementById('score');

  // Animate ship and camera to "play" position
  gsap.to(ship.position, {
    z: 0,
    y: -3,
    duration: 1.5,
    ease: "power2.out"
  });
  gsap.to(ship.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1.5,
    ease: "power2.out"
  });
  gsap.to(camera.position, {
    z: 10, // Pull camera back to see the ship
    y: 0,
    duration: 1.5,
    ease: "power2.out"
  });

  // Initialize controls and shooting
  initControls(ship);
  setupShooting(scene, ship, bullets);

  // Start spawning obstacles
  obstacleInterval = setInterval(() => {
    spawnObstacle(scene, obstacles);
  }, 1000); // Spawn one every second
}

/**
 * The main game loop, called every frame from main.js.
 * @returns {boolean} - True if the game is over, false otherwise.
 */
export function updateGame() {
  // Update player movement
  updateControls();
  
  // Update bullets and check for bullet-obstacle collisions
  updateBullets(bullets, obstacles, sceneRef, () => {
    score += 10;
    updateScoreUI();
  });

  // Update obstacles and check for player-obstacle collisions
  const isPlayerHit = updateObstacles(obstacles, sceneRef, ship);

  if (isPlayerHit) {
    endGame();
    return true; // Game is over
  }

  return false; // Game continues
}

/**
 * Resets the game to its initial state.
 * Called when the "Restart" button is clicked.
 */
export function resetGame(spaceship, scene) {
  ship = spaceship;
  sceneRef = scene;

  // Reset score
  score = 0;
  updateScoreUI();

  // Clear all bullets and obstacles from the scene and arrays
  bullets.forEach(b => sceneRef.remove(b));
  obstacles.forEach(o => sceneRef.remove(o.mesh));
  bullets.length = 0;
  obstacles.length = 0;

  // Stop the obstacle spawner
  clearInterval(obstacleInterval);

  // Reset ship position back to menu (or restart) position
  // We'll just call startGame again to animate it into place
  const camera = scene.getObjectByName("PerspectiveCamera"); // Find camera if needed
  startGame(ship, sceneRef, camera || ship.parent.children.find(c => c.isPerspectiveCamera));
}

// --- Internal Helper Functions ---

function updateScoreUI() {
  scoreEl.innerText = `Score: ${score}`;
}

function endGame() {
  console.log("GAME OVER");
  // Stop spawning
  clearInterval(obstacleInterval);

  // Optional: Add explosion effect here
}