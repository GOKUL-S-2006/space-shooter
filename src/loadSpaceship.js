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

      // Move ship to center
      ship.position.sub(center);

      // Scale to consistent size
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 8 / maxDim; // bigger
      ship.scale.setScalar(scaleFactor);

      // Rotate so it faces forward (away from camera)
      ship.rotation.y = Math.PI; // 180 degrees

      // Move ship in front of camera
      ship.position.z = -20;

      scene.add(ship);
      onLoad?.(ship);
    },
    (xhr) => {
      if (xhr.total)
        console.log(`📥 Loading: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    (err) => console.error("❌ Failed to load spaceship:", err)
  );
}
