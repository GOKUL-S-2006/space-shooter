// shooting.js
import * as THREE from 'three';

let sceneRef, shipRef, bulletsRef;
let canShoot = true;
const shootCooldown = 200; // milliseconds

const bulletGeo = new THREE.BoxGeometry(0.2, 0.2, 1.5);
const bulletMat = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00,
  emissive: 0x00ff00,
  emissiveIntensity: 10
});

/**
 * Sets up the shooting mechanic.
 * @param {THREE.Scene} scene - The main scene.
 * @param {THREE.Object3D} ship - The player's ship.
 * @param {Array} bulletsArray - The array to store active bullets.
 */
export function setupShooting(scene, ship, bulletsArray) {
  sceneRef = scene;
  shipRef = ship;
  bulletsRef = bulletsArray;

  window.addEventListener("keydown", (e) => {
    if (e.key === " " && canShoot) { // Spacebar
      shoot();
      canShoot = false;
      setTimeout(() => { canShoot = true; }, shootCooldown);
    }
  });
}

function shoot() {
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  
  // Set bullet initial position to the ship's position
  bullet.position.copy(shipRef.position);
  bullet.position.z -= 2; // Start slightly in front of the ship

  // Add to scene and array
  sceneRef.add(bullet);
  bulletsRef.push(bullet);
}

/**
 * Updates all active bullets.
 * @param {Array} bullets - The array of active bullets.
 *T* @param {Array} obstacles - The array of active obstacles.
 * @param {THREE.Scene} scene - The main scene.
 * @param {Function} onHitCallback - Function to call when an obstacle is hit.
 */
export function updateBullets(bullets, obstacles, scene, onHitCallback) {
  const bulletSpeed = 1.0;
  
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.position.z -= bulletSpeed;

    // 1. Check for off-screen
    if (bullet.position.z < -100) {
      scene.remove(bullet);
      bullets.splice(i, 1);
      continue;
    }

    // 2. Check for collision with obstacles
    for (let j = obstacles.length - 1; j >= 0; j--) {
      const obstacle = obstacles[j];
      
      // Simple AABB collision detection
      const bulletBox = new THREE.Box3().setFromObject(bullet);
      const obstacleBox = obstacle.bbox; // Use pre-calculated bbox
      
      if (bulletBox.intersectsBox(obstacleBox)) {
        // HIT!
        scene.remove(bullet);
        bullets.splice(i, 1);
        
        scene.remove(obstacle.mesh);
        obstacles.splice(j, 1);
        
        onHitCallback(); // Call to update score
        break; // Stop checking this bullet
      }
    }
  }
}