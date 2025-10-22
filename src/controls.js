// controls.js
let shipRef;
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

// Movement boundaries
const horizontalLimit = 12;
const verticalLimit = 5;
const moveSpeed = 0.2;

/**
 * Sets up keyboard event listeners.
 * @param {THREE.Object3D} ship - The player's spaceship object.
 */
export function initControls(ship) {
  shipRef = ship;
  window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) {
      keys[e.key] = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) {
      keys[e.key] = false;
    }
  });
}

/**
 * Updates the ship's position based on currently pressed keys.
 * Called every frame from the game update loop.
 */
export function updateControls() {
  if (!shipRef) return;

  if (keys.ArrowLeft && shipRef.position.x > -horizontalLimit) {
    shipRef.position.x -= moveSpeed;
  }
  if (keys.ArrowRight && shipRef.position.x < horizontalLimit) {
    shipRef.position.x += moveSpeed;
  }
  if (keys.ArrowDown && shipRef.position.y > -verticalLimit) {
    shipRef.position.y -= moveSpeed;
  }
  if (keys.ArrowUp && shipRef.position.y < verticalLimit) {
    shipRef.position.y += moveSpeed;
  }

  // Optional: Add banking (tilting) effect
  shipRef.rotation.z = (keys.ArrowLeft ? 0.2 : (keys.ArrowRight ? -0.2 : 0));
  shipRef.rotation.x = (keys.ArrowUp ? -0.1 : (keys.ArrowDown ? 0.1 : 0));
}