import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export let hyperspeed;

export function initHyperspeed(scene) {
  const loader = new GLTFLoader();
  console.log("⏳ Loading hyperspeed.glb ...");
  loader.load(
    "/models/hyperspeed.glb",
    (gltf) => {
      console.log("✅ Hyperspeed model loaded!");
      hyperspeed = gltf.scene;
      hyperspeed.scale.set(5, 5, 5);
      scene.add(hyperspeed);
    },
    (xhr) => {
      if (xhr.total) console.log(`📥 Loading: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    (err) => console.error("❌ Failed to load hyperspeed.glb:", err)
  );
}
