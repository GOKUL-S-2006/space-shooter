// loadPlanet.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadPlanet(scene, { position = [10, 0, -10], rotation = [0, Math.PI/2, 0], scale = 3 }, onLoad) {
  const loader = new GLTFLoader();
  loader.load('/models/earth.glb', (gltf) => {
    const planet = gltf.scene;
    planet.position.set(...position);      // e.g., right side of the menu
    planet.rotation.set(...rotation);      // rotate so side view is visible
    planet.scale.set(scale, scale, scale); // resize for your scene
    scene.add(planet);
    onLoad?.(planet);
  });
}
