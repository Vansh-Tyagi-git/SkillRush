import * as THREE from 'three';

// --- Custom Camera Controls ---
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

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export let cameraOrigin = new THREE.Vector3(0, 0, 0); // The point the camera looks at.
export let cameraRadius = 20; // Distance from origin.
export let cameraAzimuth = 180; // Rotation around the Y axis in degrees.
export let cameraElevation = 15; // Angle above the XZ plane in degrees.
export let controlsEnabled = true;

let isLeftMouseDown = false;
let isRightMouseDown = false;
let isMiddleMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;

export function updateCameraPosition() {
    const azimuthInRad = cameraAzimuth * DEG2RAD;
    const elevationInRad = cameraElevation * DEG2RAD;

    camera.position.x = cameraRadius * Math.sin(azimuthInRad) * Math.cos(elevationInRad);
    camera.position.y = cameraRadius * Math.sin(elevationInRad);
    camera.position.z = cameraRadius * Math.cos(azimuthInRad) * Math.cos(elevationInRad);

    camera.position.add(cameraOrigin);
    const lookTarget = cameraOrigin.clone();
    lookTarget.y += 5;  // shift upward by 5 units
    camera.lookAt(lookTarget);

    camera.updateMatrixWorld();
}

export function setCameraControlsEnabled(isEnabled) {
    controlsEnabled = isEnabled;
}

export function setCameraTransforms(origin, radius, elevation, azimuth) {
    cameraOrigin.copy(origin);
    cameraRadius = radius;
    cameraElevation = elevation;
    cameraAzimuth = azimuth;
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
