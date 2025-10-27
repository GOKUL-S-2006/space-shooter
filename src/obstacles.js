import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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


// --- Load Enemy Ship Model (From your project) ---
const gltfLoader = new GLTFLoader();
let enemyShipModel = null;
const enemyShipMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xcc0000, // Make it glow red
    emissiveIntensity: 3
});

/**
 * Loads the enemy ship model. Called by main.js
 */
export function initObstacles() {
  console.log("Loading enemy ship model (Spaceship CB1)...");
  // This path is still correct since we re-used the folder
  gltfLoader.load(
    '/models/dropship/scene.gltf', 
    (gltf) => {
      enemyShipModel = gltf.scene;
      // Apply our glowing red material to the new model
      enemyShipModel.traverse((child) => {
        if (child.isMesh) {
          child.material = enemyShipMaterial;
        }
      });
      console.log("✅ Enemy ship model (Spaceship CB1) loaded!");
    },
    undefined,
    (error) => {
      console.error("Failed to load enemy ship model", error);
    }
  );
}


// --- Spawn Area (Unchanged) ---
const spawnArea = {
  x: 12,
  y: 5,
  z: -100
};

/**
 * Spawns a new obstacle at a random position.
 */
export function spawnObstacle(scene, obstaclesArray, score) {
  
  let obstacleMesh;

  if (score < 100) {
    // --- STAGE 1: Spawn ASTEROID ---
    obstacleMesh = new THREE.Mesh(asteroidGeo, asteroidMat);
    obstacleMesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

  } else {
    // --- STAGE 2: Spawn LOADED ENEMY SHIP ---
    if (enemyShipModel) {
      obstacleMesh = enemyShipModel.clone();
      // --- MODIFIED: Guessed new scale and rotation for THIS model ---
      // This model looks like it's Y-up and facing forward
      // You may need to tweak these values!
      obstacleMesh.scale.set(0.5, 0.5, 0.5); 
      obstacleMesh.rotation.set(0, Math.PI, 0); // Rotate 180deg to face player
    } else {
      // Fallback: If model not loaded, just spawn another asteroid
      obstacleMesh = new THREE.Mesh(asteroidGeo, asteroidMat);
      obstacleMesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
    }
  }

  // Set random position (works for both)
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
 * Updates all active obstacles. (This function is unchanged)
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