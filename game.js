import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();

let environmentProxy = null;

renderer.setSize(window.innerWidth, innerHeight);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 1000);

document.body.appendChild(renderer.domElement);


camera.position.set( -3, 30, 125 );

let lightCount = 6;
let lightDistance = 3000;

let lights = [];

const lightValues = [
	{colour: 0x14D14A},
	{colour: 0xBE61CF},
	{colour: 0x00FFFF},
	{colour: 0x00FF00},
	{colour: 0x16A7F5},
	{colour: 0x90F615}
];

for (let i = 0; i < lightCount; i++){

	// Positions evenly in a circle pointed at the origin
	const light = new THREE.PointLight(0xffffff, 1);
	let lightX = lightDistance * Math.sin(Math.PI * 2 / lightCount * i);
	let lightZ = lightDistance * Math.cos(Math.PI * 2 / lightCount * i);

	// Create a light
	light.position.set(lightX, 0, lightZ)
	light.lookAt(0, 0, 0)
	scene.add(light);
	lights.push(light);

	// Visual helpers to indicate light positions
	scene.add(new THREE.PointLightHelper(light, .5, /*0xff9900*/lightValues[i]['colour']));

}


const gltfLoader = new GLTFLoader();

gltfLoader.load('../assets/glb/WholeMuseum.glb', (gltf) => {
	const root = gltf.scene;
	root.scale.set(1,1,1);
	scene.add(root);

	gltf.scene.traverse(function (child) {
		if ( child.isMesh ) {
			if (child.name.includes('main')){
				child.castShadow = true;
				child.receiveShadow = true;
			}else if (child.name.includes('Cube') ){
				//child.material.visible = false;
				environmentProxy = child;
			}}
	});
});

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const moveSpeed = 1;

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

function onKeyDown(event) {
    switch (event.keyCode) {
        case 87: // w
            moveForward = true;
            break;
        case 65: // a
            moveRight = true;
            break;
        case 83: // s
            moveBackward = true;
            break;
        case 68: // d
            moveLeft = true;
            break;
    }
}

function onKeyUp(event) {
    switch(event.keyCode) {
        case 87: // w
            moveForward = false;
            break;
        case 65: // a
            moveRight = false;
            break;
        case 83: // s
            moveBackward = false;
            break;
        case 68: // d
            moveLeft = false;
            break;
    }
}

function updatePosition() {
	if(isCursorLocked){
    if (moveForward) {
        camera.position.x -= moveSpeed * Math.sin(camera.rotation.y);
        camera.position.z -= moveSpeed * Math.cos(camera.rotation.y);
    }
    if (moveBackward) {
        camera.position.x += moveSpeed * Math.sin(camera.rotation.y);
        camera.position.z += moveSpeed * Math.cos(camera.rotation.y);
    }
    if (moveLeft) {
        camera.position.x -= moveSpeed * Math.sin(camera.rotation.y - Math.PI/2);
        camera.position.z -= moveSpeed * Math.cos(camera.rotation.y - Math.PI/2);
    }
    if (moveRight) {
        camera.position.x -= moveSpeed * Math.sin(camera.rotation.y + Math.PI/2);
        camera.position.z -= moveSpeed * Math.cos(camera.rotation.y + Math.PI/2);
    }

    // Limitar la posición de la cámara
    if (camera.position.x < -148) camera.position.x = -148;
    if (camera.position.x > 127) camera.position.x = 127;
    if (camera.position.z < -170) camera.position.z = -170;
    if (camera.position.z > 170) camera.position.z = 170;
}
}

document.addEventListener('mousemove', onDocumentMouseMove);

let isCursorLocked = false;

	let mouseX = 0;
	let mouseY = 0;

function onDocumentMouseMove(event) {
	if(isCursorLocked){

	mouseX = event.clientX;
	mouseY = event.clientY;

	const maxVerticalRotation = Math.PI / 5;
	const minVerticalRotation = -Math.PI / 5;
	//const maxHorizontalRotation = Math.PI;
	//const minHorizontalRotation = -Math.PI;
	
  
	camera.rotation.y += -(mouseX - lastMouseX);
	camera.rotation.x += -(mouseY - lastMouseY);
  
	// Limit vertical rotation
	camera.rotation.x = Math.max(minVerticalRotation, Math.min(maxVerticalRotation, camera.rotation.x));
  
	// Limit horizontal rotation
	//camera.rotation.y = Math.max(minHorizontalRotation, Math.min(maxHorizontalRotation, camera.rotation.y));
  
	lastMouseX = mouseX;
	lastMouseY = mouseY;
	}
  }

  let lastMouseX = 0;
  let lastMouseY = 0;
	
  camera.lookAt(scene.position);


  // bloquear el cursor dentro de un área específica
function lockCursor() {
	// Pide el acceso al cursor del mouse
	document.body.requestPointerLock();
	  isCursorLocked = true;
  }
  
  // desbloquear el cursor
  function unlockCursor() {
	 // Libera el acceso al cursor del mouse
	 document.exitPointerLock();
	  isCursorLocked = false;
  }
  /*
  function updateMousePosition(event) {
	// Verifica si el cursor está dentro de la ventana
	if (document.pointerLockElement === document.body) {
	  // Si se tiene acceso al cursor, actualiza la posición
	  mouseX += event.movementX;
	  mouseY += event.movementY;
  
	  // Limita la posición del mouse a los bordes de la ventana
	  mouseX = Math.max(Math.min(mouseX, window.innerWidth), 0);
	  mouseY = Math.max(Math.min(mouseY, window.innerHeight), 0);
	}
  }
*/
  document.body.addEventListener('click', lockCursor);
  
  // desactivar la restricción del cursor al presionar escape
  document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
	  unlockCursor();
	}
  });


  


function animate() {
	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	//updateMousePosition();
	updatePosition();
	console.log(camera.rotation);
	renderer.render( scene, camera );
};

animate();aw