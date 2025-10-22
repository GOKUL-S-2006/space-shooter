// obstacles.js
import * as THREE from 'three';

// Pre-create geometry and material for efficiency
const obstacleGeo = new THREE.IcosahedronGeometry(1.5, 0); // Asteroid-like
const obstacleMat = new THREE.MeshStandardMaterial({ 
  color: 0xff4444, 
  flatShading: true 
});

const spawnArea = {
  x: 12, // Matches control limits
  y: 5,  // Matches control limits
  z: -100 // Spawn distance
};

/**
 * Spawns a new obstacle at a random position.
 * @param {THREE.Scene} scene - The main scene.
 * @param {Array} obstaclesArray - The array to store active obstacles.
 */
export function spawnObstacle(scene, obstaclesArray) {
  const obstacleMesh = new THREE.Mesh(obstacleGeo, obstacleMat);

  // Set random position
  obstacleMesh.position.x = (Math.random() - 0.5) * 2 * spawnArea.x;
  obstacleMesh.position.y = (Math.random() - 0.5) * 2 * spawnArea.y;
  obstacleMesh.position.z = spawnArea.z;

  // Give it a random rotation
  obstacleMesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  
  // Create a bounding box for collision
  const bbox = new THREE.Box3().setFromObject(obstacleMesh);

  const obstacle = {
    mesh: obstacleMesh,
    bbox: bbox
  };

  obstaclesArray.push(obstacle);
  scene.add(obstacleMesh);
}

/**
 * Updates all active obstacles.
 * @param {Array} obstacles - The array of active obstacles.
 * @param {THREE.Scene} scene - The main scene.
 * @param {THREE.Object3D} ship - The player's ship.
 * @returns {boolean} - True if the player was hit, false otherwise.
 */
export function updateObstacles(obstacles, scene, ship) {
  const obstacleSpeed = 0.3;
  let playerHit = false;

  // Create ship bounding box once per frame
  const shipBox = new THREE.Box3().setFromObject(ship);
  // Shrink the ship box a little to be more forgiving
  shipBox.expandByScalar(-0.5); 

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    
    // Move obstacle towards player
    obstacle.mesh.position.z += obstacleSpeed;
    
    // Update bounding box position
    obstacle.bbox.setFromObject(obstacle.mesh);

    // 1. Check for off-screen (past player)
    if (obstacle.mesh.position.z > 15) {
      scene.remove(obstacle.mesh);
      obstacles.splice(i, 1);
      continue;
    }

    // 2. Check for collision with player
    if (shipBox.intersectsBox(obstacle.bbox)) {
      playerHit = true;
      // We don't break here; we let the game module handle the game over
    }
  }
  
  return playerHit;
}