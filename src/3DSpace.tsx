import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);


const axishelper = new THREE.AxesHelper(5);

scene.add(axishelper);

camera.position.set(5, 5, 5);
orbit.update();

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

//3D Space for visualization



// Cube
// const geometry = new THREE.BoxGeometry();

// const material = new THREE.MeshBasicMaterial({
//   color: 0x00ff00,
//   wireframe: true,
// });

// const cube = new THREE.Mesh(geometry, material);

// scene.add(cube);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();