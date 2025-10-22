// loadSpaceship.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export function loadSpaceship(scene, camera, onLoad) {
  const loader = new GLTFLoader();
  console.log("⏳ Loading spaceship.glb ...");

  loader.load(
    "/models/spaceship.glb",
    (gltf) => {
      console.log("✅ Spaceship loaded!");
      const ship = gltf.scene;

      // --- AUTO CENTER & SCALE ---
      const box = new THREE.Box3().setFromObject(ship);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Center and scale ship
      ship.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 5 / maxDim; // consistent visible size
      ship.scale.setScalar(scaleFactor);

      // Move ship closer to the camera
      ship.position.z = -15;
      ship.position.y = -2; // slightly below center view

      // Enable shadows
      ship.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(ship);

      // Pass the ship to main game logic
      onLoad?.(ship);
    },
    (xhr) => {
      if (xhr.total)
        console.log(`📥 Loading: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    (err) => console.error("❌ Failed to load spaceship:", err)
  );
}
