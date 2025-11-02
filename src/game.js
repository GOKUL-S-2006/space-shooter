import * as THREE from 'three';
import { gsap } from 'gsap';
import { initControls, updateControls } from './controls.js';
import { setupShooting, updateBullets } from './shooting.js';
import { spawnObstacle, updateObstacles } from './obstacles.js';
import { initHearts, updateHealthUI } from './ui.js';

// ---------- VARIABLES ----------
let ship;
let sceneRef;
let bullets = [];
let obstacles = [];
let score = 0;
let health = 3;
let heartsGroup;
let scoreEl;
let hitMessageEl;
let obstacleInterval;
let isGameOver = false;

// ---------- SOUND EFFECTS ----------
// 🟢 FIXED PATHS: remove "public/" prefix
const shootSound = new Audio('/sound_effects/shooting.wav');
const gameOverSound = new Audio('/sound_effects/game-over.wav');

// Optional: adjust volume
shootSound.volume = 0.4;
gameOverSound.volume = 0.6;

// ---------- GAME LOGIC ----------
export function startGame(spaceship, scene, camera) {
  ship = spaceship;
  sceneRef = scene;
  scoreEl = document.getElementById('score');
  hitMessageEl = document.getElementById('hit-message');
  isGameOver = false;
  health = 3;
  score = 0;
  updateScoreUI();

  // Hide hit message safely
  if (hitMessageEl) {
    gsap.to(hitMessageEl, { opacity: 0, duration: 0.2, visibility: 'hidden' });
  }

  if (!heartsGroup) {
    heartsGroup = initHearts(camera);
  }
  updateHealthUI(heartsGroup, health);

  gsap.to(ship.position, {
    z: 0,
    y: -3,
    duration: 1.5,
    ease: 'power2.out',
  });
  gsap.to(ship.rotation, {
    x: 0,
    y: Math.PI, // nose points at asteroids
    z: 0,
    duration: 1.5,
    ease: 'power2.out',
  });

  initControls(ship);

  // Shooting system + sound
  setupShooting(scene, ship, bullets, () => {
    playShootSound();
  });

  obstacleInterval = setInterval(() => {
    if (!isGameOver) {
      spawnObstacle(scene, obstacles, score);
    }
  }, 1000);
}

export function updateGame() {
  if (isGameOver) return true;

  updateControls();
  updateBullets(bullets, obstacles, sceneRef, () => {
    score += 10;
    updateScoreUI();
  });

  const isPlayerHit = updateObstacles(obstacles, sceneRef, ship);
  if (isPlayerHit) {
    health--;
    updateHealthUI(heartsGroup, health);

    if (health > 0) {
      showHitMessage();
    } else {
      endGame();
      return true;
    }
  }

  return false;
}

export function resetGame(spaceship, scene) {
  ship = spaceship;
  sceneRef = scene;
  isGameOver = false;
  score = 0;
  health = 3;
  updateScoreUI();

  if (heartsGroup) updateHealthUI(heartsGroup, health);
  if (hitMessageEl)
    gsap.to(hitMessageEl, { opacity: 0, duration: 0.2, visibility: 'hidden' });

  bullets.forEach((b) => sceneRef.remove(b));
  obstacles.forEach((o) => sceneRef.remove(o.mesh));
  bullets.length = 0;
  obstacles.length = 0;
  clearInterval(obstacleInterval);

  const camera =
    scene.getObjectByName('PerspectiveCamera') ||
    ship.parent.children.find((c) => c.isPerspectiveCamera);

  startGame(ship, sceneRef, camera);
}

// ---------- HELPER FUNCTIONS ----------
function updateScoreUI() {
  if (scoreEl) scoreEl.innerText = `Score: ${score}`;
}

function showHitMessage() {
  if (!hitMessageEl) return;

  hitMessageEl.innerText =
    health > 1 ? `${health} HITS REMAINING` : `1 HIT REMAINING!`;

  gsap.fromTo(
    hitMessageEl,
    { opacity: 0, scale: 0.5, visibility: 'visible' },
    {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(hitMessageEl, {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          delay: 1,
          ease: 'power1.in',
          onComplete: () => {
            hitMessageEl.visibility = 'hidden';
          },
        });
      },
    }
  );
}
function endGame() {
  isGameOver = true;
  clearInterval(obstacleInterval);
  console.log('💀 Game Over triggered, playing sound');
  playGameOverSound();
}


// ---------- SOUND PLAYERS ----------
function playShootSound() {
  const s = shootSound.cloneNode(); // allows overlapping fire
  s.volume = shootSound.volume;
  s.play().catch((err) => console.warn('Audio play blocked:', err));
}

function playGameOverSound() {
  gameOverSound.currentTime = 0;
  gameOverSound.play().catch((err) => console.warn('Audio play blocked:', err));
}
