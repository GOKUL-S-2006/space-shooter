import * as THREE from 'three';

// --- ASTEROID SETUP ---
const textureLoader = new THREE.TextureLoader();
const moonTexture = textureLoader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg');

const asteroidMat = new THREE.MeshStandardMaterial({
  map: moonTexture,
  bumpMap: moonTexture,
  bumpScale: 0.05,
  color: 0xbbbbbb,
  emissive: 0x111111,
});

const asteroidGeo = new THREE.IcosahedronGeometry(1.5, 3);
const positions = asteroidGeo.attributes.position.array;
for (let i = 0; i < positions.length; i += 3) {
  const x = positions[i];
  const y = positions[i + 1];
  const z = positions[i + 2];
  const vertex = new THREE.Vector3(x, y, z);
  const scale = 1 + (Math.random() - 0.5) * 0.5; 
  vertex.normalize().multiplyScalar(1.5 * scale);
  positions[i] = vertex.x;
  positions[i + 1] = vertex.y;
  positions[i + 2] = vertex.z;
}
asteroidGeo.computeVertexNormals();


// --- Spawn Area ---
const spawnArea = {
  x: 12,
  y: 5,
  z: -100
};

// Initialize obstacles (for compatibility)
export function initObstacles() {
  console.log("✅ Obstacles (asteroids only) initialized.");
}

/**
 * Spawns a new asteroid obstacle at a random position.
 */
export function spawnObstacle(scene, obstaclesArray, score) {
  const obstacleMesh = new THREE.Mesh(asteroidGeo, asteroidMat);
  obstacleMesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  obstacleMesh.position.x = (Math.random() - 0.5) * 2 * spawnArea.x;
  obstacleMesh.position.y = (Math.random() - 0.5) * 2 * spawnArea.y;
  obstacleMesh.position.z = spawnArea.z;
  
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
 */
export function updateObstacles(obstacles, scene, ship) {
  const obstacleSpeed = 0.3;
  let playerHit = false;

  const shipBox = new THREE.Box3().setFromObject(ship);
  shipBox.expandByScalar(-0.5); 

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    
    obstacle.mesh.position.z += obstacleSpeed;
    obstacle.bbox.setFromObject(obstacle.mesh);

    if (obstacle.mesh.position.z > 15) {
      scene.remove(obstacle.mesh);
      obstacles.splice(i, 1);
      continue;
    }

    if (shipBox.intersectsBox(obstacle.bbox)) {
      playerHit = true;
      scene.remove(obstacle.mesh);
      obstacles.splice(i, 1);
      continue;
    }
  }
  
  return playerHit;
}
