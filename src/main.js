import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#101722");
scene.fog = new THREE.Fog("#101722", 12, 45);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 6, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb7c8df, 0x29231d, 1.8));

const moonLight = new THREE.DirectionalLight(0xa9c7ff, 2);
moonLight.position.set(-5, 10, 5);
moonLight.castShadow = true;
scene.add(moonLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: "#252a25" })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const path = new THREE.Mesh(
  new THREE.PlaneGeometry(2.5, 35),
  new THREE.MeshStandardMaterial({ color: "#45443d" })
);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0.02, -5);
scene.add(path);

function createGrave(x, z) {
  const grave = new THREE.Group();
  grave.position.set(x, 0, z);

  const stoneMaterial = new THREE.MeshStandardMaterial({ color: "#626a72" });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.2, 0.7),
    new THREE.MeshStandardMaterial({ color: "#3d4650" })
  );
  base.position.y = 0.1;
  base.castShadow = true;
  grave.add(base);

  const headstone = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 1, 0.18),
    stoneMaterial
  );
  headstone.position.set(0, 0.65, -0.2);
  headstone.castShadow = true;
  grave.add(headstone);

  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.025, 0.02),
      new THREE.MeshStandardMaterial({ color: "#343b43" })
    );
    line.position.set(0, 0.85 - i * 0.13, -0.095);
    grave.add(line);
  }

  return grave;
}

for (let row = 0; row < 5; row++) {
  const z = 5 - row * 4;
  scene.add(createGrave(-3, z));
  scene.add(createGrave(3, z));
}

function createTree(x, z) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, 2.5, 7),
    new THREE.MeshStandardMaterial({ color: "#302820" })
  );
  trunk.position.y = 1.25;
  trunk.castShadow = true;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 2.8, 7),
    new THREE.MeshStandardMaterial({ color: "#26352e" })
  );
  leaves.position.y = 3.2;
  leaves.castShadow = true;
  tree.add(leaves);

  return tree;
}

for (let i = 0; i < 8; i++) {
  const z = 8 - i * 4;
  scene.add(createTree(-7, z));
  scene.add(createTree(7, z));
}

const player = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(0.55, 0.9, 0.35),
  new THREE.MeshStandardMaterial({ color: "#29394b" })
);
body.position.y = 1;
body.castShadow = true;
player.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 12, 12),
  new THREE.MeshStandardMaterial({ color: "#b0a89a" })
);
head.position.y = 1.65;
head.castShadow = true;
player.add(head);

const lantern = new THREE.Mesh(
  new THREE.BoxGeometry(0.18, 0.25, 0.18),
  new THREE.MeshStandardMaterial({
    color: "#ffbe66",
    emissive: "#ff8a24",
    emissiveIntensity: 1.5
  })
);
lantern.position.set(0.42, 0.75, 0);
player.add(lantern);

const lanternLight = new THREE.PointLight("#ffad50", 1.5, 4);
lanternLight.position.set(0.42, 0.8, 0);
player.add(lanternLight);

player.position.set(0, 0, 3);
scene.add(player);

const cameraOffset = new THREE.Vector3(0, 5, 8);

const keys = {};
const status = document.querySelector("#status");

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

let dragging = false;
let lastX = 0;
let lastY = 0;
let cameraAngle = 0;
let cameraHeight = 5;

renderer.domElement.addEventListener("pointerdown", (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointerup", () => {
  dragging = false;
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  cameraAngle -= (event.clientX - lastX) * 0.006;
  cameraHeight += (event.clientY - lastY) * 0.015;
  cameraHeight = THREE.MathUtils.clamp(cameraHeight, 2.5, 9);
  lastX = event.clientX;
  lastY = event.clientY;
});

renderer.domElement.addEventListener("wheel", (event) => {
  cameraOffset.z += event.deltaY * 0.008;
  cameraOffset.z = THREE.MathUtils.clamp(cameraOffset.z, 5, 13);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const speed = 3 * delta;
  let moving = false;

  if (keys.w || keys.arrowup) { player.position.z -= speed; moving = true; }
  if (keys.s || keys.arrowdown) { player.position.z += speed; moving = true; }
  if (keys.a || keys.arrowleft) { player.position.x -= speed; moving = true; }
  if (keys.d || keys.arrowright) { player.position.x += speed; moving = true; }

  player.position.x = THREE.MathUtils.clamp(player.position.x, -25, 25);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -17, 12);

  if (moving) {
    status.textContent = "در حال قدم زدن...";
  } else {
    status.textContent = "برای شروع حرکت کن...";
  }

  head.position.y = 1.65 + (moving ? Math.sin(clock.elapsedTime * 12) * 0.035 : 0);

  const offsetX = Math.sin(cameraAngle) * cameraOffset.z;
  const offsetZ = Math.cos(cameraAngle) * cameraOffset.z;
  camera.position.set(
    player.position.x + offsetX,
    cameraHeight,
    player.position.z + offsetZ
  );
  camera.lookAt(player.position.x, 0.8, player.position.z);

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
