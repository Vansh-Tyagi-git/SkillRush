import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // OrbitControls is no longer needed
import { journeyData } from './quiz.js';
import { setupQuizGUI } from './quizGUI.js';

// --- Basic Scene Setup (Unchanged) ---
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(0, 10, 20); // Initial position will be set by the custom controls

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// --- NEW: Custom Camera Controls ---
const LEFT_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

const MIN_CAMERA_RADIUS = 5;
const MAX_CAMERA_RADIUS = 50;
const MIN_CAMERA_ELEVATION = 5;
const MAX_CAMERA_ELEVATION = 85;
const ROTATION_SENSITIVITY = 0.3;
const ZOOM_SENSITIVITY = 0.05;
const PAN_SENSITIVITY = -0.01;

const DEG2RAD = Math.PI / 180;
const Y_AXIS = new THREE.Vector3(0, 1, 0);

let cameraOrigin = new THREE.Vector3(0, 0, 0); // The point the camera looks at.
let cameraRadius = 20; // Distance from origin.
let cameraAzimuth = 180; // Rotation around the Y axis in degrees.
let cameraElevation = 25; // Angle above the XZ plane in degrees.

let isLeftMouseDown = false;
let isRightMouseDown = false;
let isMiddleMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;
let controlsEnabled = true;

function updateCameraPosition() {
    const azimuthInRad = cameraAzimuth * DEG2RAD;
    const elevationInRad = cameraElevation * DEG2RAD;

    camera.position.x = cameraRadius * Math.sin(azimuthInRad) * Math.cos(elevationInRad);
    camera.position.y = cameraRadius * Math.sin(elevationInRad);
    camera.position.z = cameraRadius * Math.cos(azimuthInRad) * Math.cos(elevationInRad);
    
    camera.position.add(cameraOrigin);
    camera.lookAt(cameraOrigin);
    camera.updateMatrixWorld();
}

// Event Listeners for new controls
window.addEventListener('mousedown', (e) => {
    // Ignore clicks on the UI
    if (e.target.closest('#quiz-container')) return;

    if (!controlsEnabled) return;
    if (e.button === LEFT_MOUSE_BUTTON) isLeftMouseDown = true;
    if (e.button === MIDDLE_MOUSE_BUTTON) isMiddleMouseDown = true;
    if (e.button === RIGHT_MOUSE_BUTTON) isRightMouseDown = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
});

window.addEventListener('mouseup', (e) => {
    if (e.button === LEFT_MOUSE_BUTTON) isLeftMouseDown = false;
    if (e.button === MIDDLE_MOUSE_BUTTON) isMiddleMouseDown = false;
    if (e.button === RIGHT_MOUSE_BUTTON) isRightMouseDown = false;
});

window.addEventListener('mousemove', (e) => {
    if (!controlsEnabled || (!isLeftMouseDown && !isRightMouseDown && !isMiddleMouseDown)) return;

    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;

    // Left Mouse: Pan
    if (isLeftMouseDown) {
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
        const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
        cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * deltaY));
        cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * deltaX));
    }

    // Middle Mouse: Zoom
    if (isMiddleMouseDown) {
        cameraRadius += deltaY * ZOOM_SENSITIVITY;
        cameraRadius = Math.max(MIN_CAMERA_RADIUS, Math.min(MAX_CAMERA_RADIUS, cameraRadius));
    }

    // Right Mouse: Rotate
    if (isRightMouseDown) {
        cameraAzimuth += -(deltaX * ROTATION_SENSITIVITY);
        cameraElevation += (deltaY * ROTATION_SENSITIVITY);
        cameraElevation = Math.max(MIN_CAMERA_ELEVATION, Math.min(MAX_CAMERA_ELEVATION, cameraElevation));
    }
    
    updateCameraPosition();
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
});

window.addEventListener('wheel', e => {
    // Ignore wheel events on the UI
    if (e.target.closest('#quiz-container')) return;

    if (!controlsEnabled) return;
    const delta = e.deltaY * -0.01;
    cameraRadius += delta * (ZOOM_SENSITIVITY * 20); // scrolling is more sensitive
    cameraRadius = Math.max(MIN_CAMERA_RADIUS, Math.min(MAX_CAMERA_RADIUS, cameraRadius));
    updateCameraPosition();
});


const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshLambertMaterial({ color: 0x50C878 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const character = new THREE.Group();
// ... (Character creation is unchanged)
const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), new THREE.MeshStandardMaterial({ color: 0x9333EA }));
body.castShadow = true; character.add(body);
const belly = new THREE.Mesh(new THREE.CircleGeometry(0.35, 32), new THREE.MeshStandardMaterial({ color: 0xF5D0FE }));
belly.position.z = 0.48; character.add(belly);
const eyeGroup = new THREE.Group();
const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
leftEye.position.set(-0.17, 0.12, 0.4);
const rightEye = leftEye.clone(); rightEye.position.x = -leftEye.position.x; eyeGroup.add(leftEye, rightEye);
const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 8), new THREE.MeshStandardMaterial({ color: 0x000000 }));
leftPupil.position.set(-0.17, 0.12, 0.48);
const rightPupil = leftPupil.clone(); rightPupil.position.x = -leftPupil.position.x; eyeGroup.add(leftPupil, rightPupil); character.add(eyeGroup);
const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 4), new THREE.MeshStandardMaterial({ color: 0xFBBF24 }));
beak.position.set(0, 0, 0.45); beak.rotation.x = Math.PI / 2; beak.rotation.z = Math.PI / 4; character.add(beak);
scene.add(character);


function generatePathPoints(numPoints) {
    const points = [];
    const xPattern = [0, 10, 0, -10];
    for (let i = 0; i < numPoints; i++) {
        const x = xPattern[i % 4];
        const y = 0;
        const z = 10 - i * 8;
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
}

const pathPoints = generatePathPoints(journeyData.length);
const curve = new THREE.CatmullRomCurve3(pathPoints);
const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.1, 8, false), new THREE.MeshLambertMaterial({ color: 0xFFD700 }));
tube.receiveShadow = true;
scene.add(tube);


const levelObjects = [];
const TOTAL_LEVELS = journeyData.length;

function createLevelNodes() {
  levelObjects.forEach(o => scene.remove(o));
  levelObjects.length = 0;
  journeyData.forEach((lvl,i) => {
    const pt = curve.getPointAt(i / (TOTAL_LEVELS > 1 ? TOTAL_LEVELS - 1 : 1));
    const mat = new THREE.MeshStandardMaterial({ color:
      lvl.status==='completed'?0x22C55E:
      lvl.status==='unlocked'?0xA855F7:0x9CA3AF });
    const node = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.2,32), mat);
    node.position.copy(pt);
    node.castShadow=true;
    node.userData = { levelId:lvl.id, status:lvl.status };
    scene.add(node);
    levelObjects.push(node);
  });
}
createLevelNodes();

let currentLevelId = 0;
let activeTransition = null; 

function setInitialPositions(levelId) {
    const point = curve.getPointAt(levelId / (TOTAL_LEVELS > 1 ? TOTAL_LEVELS - 1 : 1));
    character.position.set(point.x, point.y + 0.8, point.z);
    
    cameraOrigin.copy(point);
    const offset = new THREE.Vector3(0, 10, 10);
    const camPos = point.clone().add(offset);
    
    const relativePos = camPos.clone().sub(cameraOrigin);
    cameraRadius = relativePos.length();
    cameraElevation = Math.asin(relativePos.y / cameraRadius) / DEG2RAD;
    cameraAzimuth = Math.atan2(relativePos.x, relativePos.z) / DEG2RAD;

    updateCameraPosition();
}

Object.defineProperty(scene, 'currentLevelId', {
  get: () => currentLevelId,
  set: (newLevelId) => {
    if (newLevelId === currentLevelId || activeTransition) return;

    const endPoint = curve.getPointAt(newLevelId / (TOTAL_LEVELS - 1));
    const endCamPos = endPoint.clone().add(new THREE.Vector3(0, 10, 10));

    const endRelativePos = endCamPos.clone().sub(endPoint);
    const endRadius = endRelativePos.length();
    const endElevation = Math.asin(endRelativePos.y / endRadius) / DEG2RAD;
    const endAzimuth = Math.atan2(endRelativePos.x, endRelativePos.z) / DEG2RAD;

    activeTransition = {
        startCharPos: character.position.clone(),
        endCharPos: new THREE.Vector3(endPoint.x, endPoint.y + 0.8, endPoint.z),
        
        startOrigin: cameraOrigin.clone(),
        endOrigin: endPoint.clone(),
        startRadius: cameraRadius,
        endRadius: endRadius,
        startElevation: cameraElevation,
        endElevation: endElevation,
        startAzimuth: cameraAzimuth,
        endAzimuth: endAzimuth,

        startTime: Date.now(),
        duration: 1500,
    };

    currentLevelId = newLevelId;
  }
});

setInitialPositions(currentLevelId);

const { showQuiz, quizContainer } = setupQuizGUI(journeyData, createLevelNodes, null, scene);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', e => {
  if (!quizContainer.classList.contains('hidden') || activeTransition) return;
  
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(levelObjects);
  if (hits.length > 0 && hits[0].object.userData.status !== 'locked') {
    showQuiz(hits[0].object.userData.levelId);
  }
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  
  if (activeTransition) {
    const progress = Math.min((Date.now() - activeTransition.startTime) / activeTransition.duration, 1);
    
    character.position.lerpVectors(activeTransition.startCharPos, activeTransition.endCharPos, progress);
    
    // Animate the custom camera properties
    cameraOrigin.lerpVectors(activeTransition.startOrigin, activeTransition.endOrigin, progress);
    cameraRadius = THREE.MathUtils.lerp(activeTransition.startRadius, activeTransition.endRadius, progress);
    cameraElevation = THREE.MathUtils.lerp(activeTransition.startElevation, activeTransition.endElevation, progress);
    cameraAzimuth = THREE.MathUtils.lerp(activeTransition.startAzimuth, activeTransition.endAzimuth, progress);
    
    updateCameraPosition();
    controlsEnabled = false;

    if (progress >= 1) {
        activeTransition = null;
        controlsEnabled = true;
    }
  } else {
    // Regular bobbing animation when idle
    const elapsed = clock.getElapsedTime();
    const baseBob = Math.sin(elapsed * 5) * 0.05;
    const point = curve.getPointAt(currentLevelId / (TOTAL_LEVELS > 1 ? TOTAL_LEVELS - 1 : 1));
    character.position.y = point.y + 0.8 + baseBob;
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraPosition();
});

