import * as THREE from 'three';

// --- Always visible, unaffected by lights ---
const heartMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});

const extrudeSettings = {
  steps: 1,
  depth: 0.2,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.05,
  bevelSegments: 3
};

function createHeartMesh() {
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x + 0.25, y + 0.25);
  heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
  heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
  heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
  heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
  heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
  heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  geometry.scale(1.5, 1.5, 1.5); // make it much bigger
  geometry.rotateZ(Math.PI);
  geometry.translate(-0.3, -0.5, 0);

  const mesh = new THREE.Mesh(geometry, heartMaterial);
  return mesh;
}

export function initHearts(camera) {
  const heartsGroup = new THREE.Group();

  for (let i = 0; i < 3; i++) {
    const heart = createHeartMesh();
    heart.position.x = i * 1; // more spacing
    heartsGroup.add(heart);
  }

  // Attach to camera (so it moves with view)
  camera.add(heartsGroup);

  // --- place slightly in front of camera (important!) ---
  const zOffset = -2; // closer to view
  heartsGroup.position.set(-3, 2, zOffset); // near top-left

  console.log("❤️ Hearts added to camera:", heartsGroup);

  return heartsGroup;
}

export function updateHealthUI(heartsGroup, health) {
  if (!heartsGroup) return;
  heartsGroup.children.forEach((heart, i) => {
    heart.visible = i < health;
  });
}
