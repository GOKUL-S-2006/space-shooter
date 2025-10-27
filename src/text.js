import * as THREE from 'three';
import { gsap } from 'gsap';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let hitMessage1, hitMessage2, gameOverMessage;
let fontInstance;
let cameraRef;

const textMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff, // Set base color to white
  emissive: 0xFF4136, // Make it GLOW this red color
  emissiveIntensity: 2.5, // How bright the glow is
  transparent: true,
  opacity: 0
});

const fontSettings = {
  size: 0.5,
  height: 0.1,
  curveSegments: 12,
  bevelEnabled: false
};

/**
 * Loads the font and creates the text meshes.
 * Call this from main.js.
 * @param {THREE.Camera} camera
 */
export function initText(camera) {
  cameraRef = camera;
  const loader = new FontLoader();
  
  console.log('text.js: Starting font load...'); // --- ADDED

  // Use CDN link
  loader.load(
    'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json', 
    (font) => {
      // --- Font successfully loaded ---
      console.log('✅ text.js: Font LOADED successfully!'); // --- ADDED
      fontInstance = font;

      // --- Create Game Over Text ---
      let geometry = new TextGeometry('GAME OVER', { ...fontSettings, font: font });
      geometry.center(); 
      gameOverMessage = new THREE.Mesh(geometry, textMaterial.clone());
      gameOverMessage.scale.set(1.5, 1.5, 1.5); 
      gameOverMessage.position.set(0, 0.5, -5); 
      gameOverMessage.visible = false;
      camera.add(gameOverMessage);
      console.log('text.js: Created GAME OVER mesh.'); // --- ADDED

      // --- Create "2 HITS" Text ---
      geometry = new TextGeometry('2 HITS REMAINING', { ...fontSettings, font: font });
      geometry.center();
      hitMessage2 = new THREE.Mesh(geometry, textMaterial.clone());
      hitMessage2.position.set(0, 0.5, -5);
      hitMessage2.visible = false;
      camera.add(hitMessage2);

      // --- Create "1 HIT" Text ---
      geometry = new TextGeometry('1 HIT REMAINING!', { ...fontSettings, font: font });
      geometry.center();
      hitMessage1 = new THREE.Mesh(geometry, textMaterial.clone());
      hitMessage1.position.set(0, 0.5, -5);
      hitMessage1.visible = false;
      camera.add(hitMessage1);
      
      console.log('text.js: Created all hit message meshes.'); // --- ADDED
    },
    undefined, // onProgress callback (not needed)
    (error) => {
      // --- Font FAILED to load ---
      console.error('❌ text.js: FAILED to load font!', error); // --- ADDED
    }
  );
}

/**
 * Shows the "Hits Remaining" message.
 * Call this from game.js.
 * @param {number} health
 */
export function show3DHitMessage(health) {
  // --- MODIFIED CHECK ---
  if (!fontInstance) { 
    console.warn('text.js: show3DHitMessage called, but font is not loaded yet!');
    return; 
  }

  // Hide all messages first
  if (hitMessage1) hitMessage1.visible = false;
  if (hitMessage2) hitMessage2.visible = false;

  let meshToShow = null;
  if (health === 2) meshToShow = hitMessage2;
  if (health === 1) meshToShow = hitMessage1;

  if (!meshToShow) {
     console.error('text.js: Could not find mesh for health:', health);
     return;
  }
  
  console.log(`text.js: Showing 3D hit message for ${health} health.`); // --- ADDED
  meshToShow.visible = true;

  // Animate it
  gsap.fromTo(meshToShow.material,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.3,
      onComplete: () => {
        // Fade out after a delay
        gsap.to(meshToShow.material, {
          opacity: 0,
          duration: 0.5,
          delay: 1,
          onComplete: () => {
            meshToShow.visible = false;
          }
        });
      }
    }
  );
}

/**
 * Shows or hides the "Game Over" message.
 * Call this from game.js.
 * @param {boolean} visible
 */
export function show3DGameOver(visible) {
  // --- MODIFIED CHECK ---
  if (!fontInstance) {
    console.warn('text.js: show3DGameOver called, but font is not loaded yet!');
    return;
  }
  
  if (!gameOverMessage) {
    console.error('text.js: show3DGameOver called, but gameOverMessage mesh does not exist!');
    return;
  }
  
  if (visible) {
    console.log('text.js: Showing 3D GAME OVER message.'); // --- ADDED
    gameOverMessage.visible = true;
    gsap.to(gameOverMessage.material, { opacity: 1, duration: 0.5 });
    gsap.fromTo(gameOverMessage.scale,
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 1.5, y: 1.5, z: 1.5, duration: 0.5, ease: "power2.out" }
    );
  } else {
    // Just hide it instantly on reset
    gameOverMessage.visible = false;
    gameOverMessage.material.opacity = 0;
  }
}