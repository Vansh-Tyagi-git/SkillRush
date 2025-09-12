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
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';




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

// UPDATED: Configure the Directional Light for shadows
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(0, 80, -150);
dirLight.castShadow = true;

// Configure the shadow camera's view frustum
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 500;

// Optional: Increase shadow map resolution for better quality
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

scene.add(dirLight);

const loader2 = new GLTFLoader();
loader2.load('/models/grass.glb', (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      const material = child.material;

      if (material.map) {
        console.log("Found texture:", material.map);

        // Enable repeating
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;

        // Control tiling: higher = smaller tiles, less stretched
        material.map.repeat.set(1, 5); 
        // X → across width (40), Y → across length (300)

        const newMaterial = new THREE.MeshStandardMaterial({ map: material.map });

        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 300),
          newMaterial
        );

        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
      }
    }
  });
});




// --- Character ---
const character = new THREE.Group();

// Head: A bright yellow sphere
const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFEB3B, // Classic smiley yellow
    roughness: 0.4,
    metalness: 0.1
});
const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 64, 32), headMaterial);
head.position.y += 1;
character.add(head);

// Eyes: Two simple, slightly squashed black spheres
const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.2
});

const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16), eyeMaterial);
leftEye.position.set(-0.25, 0.2, 0.6);
leftEye.scale.set(0.8, 1.2, 0.8); // Make them slightly oval-shaped
const rightEye = leftEye.clone();
rightEye.position.x = -leftEye.position.x;
leftEye.position.y += 1;
rightEye.position.y += 1;
character.add(leftEye, rightEye);

// Smile: Created using a segment of a TorusGeometry (a donut shape)
const smileMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.2
});
// Parameters: (radius, tubeRadius, radialSegments, tubularSegments, arc)
// The 'arc' parameter is key to making just a smile instead of a full circle.
const smileCurve = new THREE.TorusGeometry(0.3, 0.05, 16, 100, Math.PI);
const smile = new THREE.Mesh(smileCurve, smileMaterial);
smile.position.set(0, -0.1, 0.55);
smile.rotation.z = Math.PI; // Flip it upside down to form a smile
smile.position.y += 1;
character.add(smile);


// --- Scaling and Shadows ---

// Scale the entire character up to be a good size in the scene
character.scale.set(1.5, 1.5, 1.5);


// Traverse the character group to set castShadow and receiveShadow on all meshes
character.traverse(function(child) {
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true; // Allows shadows to be cast onto the smiley itself
    }
});
character.position.y += 1;
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
const textureLoader2 = new THREE.TextureLoader();
const diff = textureLoader2.load('/src/textures/diff.png');
const nor = textureLoader2.load('/src/textures/nor.png');
const rough = textureLoader2.load('/src/textures/rough.png');
const ao = textureLoader2.load('/src/textures/ao.png');
const dis = textureLoader2.load('/src/textures/dis.png');

// Repeat wrapping
[diff, nor, rough, ao, dis].forEach(tex => {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
});

const curveLength = curve.getLength();
diff.repeat.set(curveLength / 5, 1);

const material = new THREE.MeshStandardMaterial({
  map: diff,
  normalMap: nor,
  roughnessMap: rough,
  aoMap: ao,
  displacementMap: dis,
  displacementScale: 0.05,
  side: THREE.DoubleSide
});

const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, .7, 10, false), material);
tube.receiveShadow = true;
tube.castShadow = true;
tube.position.y = -.5;
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
    const node = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.7,32), mat);
    node.position.copy(pt);
    node.receiveShadow = true;
    node.castShadow = true;
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

// --- Load Trees ---
const loader = new GLTFLoader();
loader.load('/models/trees.glb', (gltf) => {
  const treeModel = gltf.scene;
  treeModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const trees = new THREE.Group();

  // Place trees along both edges of the ground
  const spacing = 100; // distance between trees along Z
  for (let z = -100; z <= 100; z += spacing) {
    // Left edge
    const leftTree = treeModel.clone();
    leftTree.position.set(-18, 0, z);
    leftTree.scale.set(2, 2, 2);
    leftTree.rotation.y = -Math.PI / 2;
    trees.add(leftTree);

    // Right edge
    const rightTree = treeModel.clone();
    rightTree.position.set(18, 0, z);
    rightTree.scale.set(2, 2, 2);
    rightTree.rotation.y = Math.PI / 2;
    trees.add(rightTree);
  }

  scene.add(trees);
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
