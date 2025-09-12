import * as THREE from 'three';
import { journeyData } from './quiz.js';
import { setupQuizGUI } from './quizGUI.js';
import { 
  camera, 
  updateCameraPosition, 
  setCameraControlsEnabled, 
  setCameraTransforms, 
  cameraOrigin, 
  cameraRadius, 
  cameraElevation, 
  cameraAzimuth 
} from './camera.js';
import { Sky } from 'three/addons/objects/Sky.js';

// --- Basic Scene Setup ---
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();


// --- Sky ---
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

// Sun position setup
const phi = THREE.MathUtils.degToRad(90);
const theta = THREE.MathUtils.degToRad(180);
const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);

sky.material.uniforms['sunPosition'].value.copy(sunPosition);


const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// --- Ground ---
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('src/textures/grass.jpg');
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40 , 300),
  new THREE.MeshStandardMaterial({ map: grassTexture })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- Character ---
const character = new THREE.Group();
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

// --- Path and Levels ---
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
    const node = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.5,32), mat);
    node.position.copy(pt);
    node.castShadow=true;
    node.userData = { levelId:lvl.id, status:lvl.status };
    scene.add(node);
    levelObjects.push(node);
  });
}
createLevelNodes();

// --- Game Logic & Animation ---
let currentLevelId = 0;
let activeTransition = null; 

const DEG2RAD = Math.PI / 180;

function setInitialPositions(levelId) {
    const point = curve.getPointAt(levelId / (TOTAL_LEVELS > 1 ? TOTAL_LEVELS - 1 : 1));
    character.position.set(point.x, point.y + 1, point.z);
    
    const offset = new THREE.Vector3(0, 10, 10);
    const camPos = point.clone().add(offset);
    
    const relativePos = camPos.clone().sub(point);
    const radius = relativePos.length();
    const elevation = Math.asin(relativePos.y / radius) / DEG2RAD;
    const azimuth = Math.atan2(relativePos.x, relativePos.z) / DEG2RAD;

    setCameraTransforms(point, radius, elevation, azimuth);
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

// --- UI & Interaction ---
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


// --- Animate Loop ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  
  if (activeTransition) {
    const progress = Math.min((Date.now() - activeTransition.startTime) / activeTransition.duration, 1);
    
    character.position.lerpVectors(activeTransition.startCharPos, activeTransition.endCharPos, progress);
    
    // Animate the custom camera properties
    const newOrigin = new THREE.Vector3().lerpVectors(activeTransition.startOrigin, activeTransition.endOrigin, progress);
    const newRadius = THREE.MathUtils.lerp(activeTransition.startRadius, activeTransition.endRadius, progress);
    const newElevation = THREE.MathUtils.lerp(activeTransition.startElevation, activeTransition.endElevation, progress);
    const newAzimuth = THREE.MathUtils.lerp(activeTransition.startAzimuth, activeTransition.endAzimuth, progress);
    
    setCameraTransforms(newOrigin, newRadius, newElevation, newAzimuth);
    updateCameraPosition();
    setCameraControlsEnabled(false);

    if (progress >= 1) {
        activeTransition = null;
        setCameraControlsEnabled(true);
    }
  } else {
    // Regular bobbing animation when idle
    const elapsed = clock.getElapsedTime();
    const baseBob = Math.sin(elapsed * 5) * 0.05;
    const point = curve.getPointAt(currentLevelId / (TOTAL_LEVELS > 1 ? TOTAL_LEVELS - 1 : 1));
    character.position.y = point.y + 1 + baseBob;
  }

  renderer.render(scene, camera);
}
animate();


// --- Resize Listener ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraPosition();
});
