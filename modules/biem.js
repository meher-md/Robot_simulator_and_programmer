import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { biem, viewport } from "../src/main.js";
import {Window} from "./window.js"
import * as dat from "dat.gui";

let biem_gui = new dat.GUI({autoPlace: false});
document.querySelector('#biem-gui').appendChild(biem_gui.domElement);

function onMouseMove(event) {
  if (biem.helper.visible) {
    const rect = biem.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), biem.camera);
    const intersections = raycaster.intersectObject(biem.plane);

    if (intersections.length > 0) {
      biem.controls.enabled = false;
      biem.sphere.visible = true;
      biem.canvas.style.cursor = "none";
      
      const intersectionPoint = intersections[0].point;
      biem.sphere.position.copy(intersectionPoint);
      
      document.addEventListener( 'mousedown', onMouseDown );
    } else {
      biem.controls.enabled = true;
      biem.sphere.visible = false;
      biem.canvas.style.cursor = "auto";

      document.removeEventListener('mousedown', onMouseDown );
      document.removeEventListener('mouseup', onMouseUpAfterMouseDown);
      document.removeEventListener('mousemove', onMouseMoveAfterMouseDown);
    }
}
}

function getMousePosition(event) {
  const rect = biem.canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), biem.camera);
  const intersections = raycaster.intersectObject(biem.plane);

  if (intersections.length > 0) {
    const intersectionPoint = intersections[0].point;
    return intersectionPoint;
  }
}

let initialMousePosition, newPlane;

function onMouseDown(event) {
    initialMousePosition = getMousePosition(event);
    document.addEventListener('mouseup', onMouseUpAfterMouseDown);
    document.addEventListener('mousemove', onMouseMoveAfterMouseDown);
  
    // Create a new plane at the initial mouse position
    const newPlaneGeometry = new THREE.PlaneGeometry(0, 0);
    const newPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5555,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    newPlane = new THREE.Mesh(newPlaneGeometry, newPlaneMaterial);
    newPlane.rotation.set(-Math.PI / 2, 0, 0);
    biem.scene.add(newPlane);
}

function onMouseMoveAfterMouseDown(event){
  const currentMousePosition = getMousePosition(event);
  const deltaX = currentMousePosition.x - initialMousePosition.x;
  const deltaY = currentMousePosition.z - initialMousePosition.z;

  newPlane.geometry = new THREE.PlaneGeometry(Math.abs(deltaX), Math.abs(deltaY));
  newPlane.position.set(
    initialMousePosition.x + deltaX / 2,
    biem.plane.position.y+0.00001,
    initialMousePosition.z + deltaY / 2
  );
}

function onMouseUpAfterMouseDown(event) {
  const finalMousePosition = getMousePosition(event);

  if (newPlane) {
    const deltaX = finalMousePosition.x - initialMousePosition.x;
    const deltaY = finalMousePosition.z - initialMousePosition.z;

    newPlane.geometry = new THREE.PlaneGeometry(Math.abs(deltaX), Math.abs(deltaY));
    newPlane.position.set(
      initialMousePosition.x + deltaX / 2,
      biem.plane.position.y+0.00001,
      initialMousePosition.z + deltaY / 2
    );
      
    document.removeEventListener('mouseup', onMouseUpAfterMouseDown);
    document.removeEventListener('mousemove', onMouseMoveAfterMouseDown);
  }
}

class BIEM extends Window {
  constructor(window){
    super(window);

    this.axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( this.axesHelper );

    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true, // enable transparency
      opacity: 0, // set opacity to 0.5
      side: THREE.DoubleSide,
    });
    this.plane = new THREE.Mesh( geometry, material );
    this.plane.rotation.set(-Math.PI/2, 0, 0)
    this.plane.visible = false;
    
    this.scene.add( this.plane );


    // Add a grid helper to the scene
    this.helper = new THREE.GridHelper( 1, 8, 0x333333, 0x333333);
    this.helper.receiveShadow = true; // Set receiveShadow to true
    this.scene.add(this.helper);

    const sphereGeometry = new THREE.SphereGeometry( 0.01, 32, 32 );
    const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    this.sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    this.sphere.name = "sphere";
    this.scene.add( this.sphere );

    // Add orbit controls to the camera
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.3;

    // Set the camera position and update the controls
    this.camera.position.z = 1;
    this.camera.position.y = 1;
    this.controls.update();

    // this.slider = document.getElementById("heightSlider");

    document.addEventListener('mousemove', onMouseMove );

    // create the sliders and add them to the GUI
    biem_gui.add(this.plane.position, "y", 0, 1, 0.01).onChange(() => {
      this.helper.position.y = this.plane.position.y;
    });

    biem_gui.add(this.plane.scale, "x", 1, 10, 0.1).name("Scale X").onChange(() => {
      this.helper.scale.x = this.plane.scale.x;
    });
    biem_gui.add(this.plane.scale, "y", 1, 10, 0.1).name("Scale Y").onChange(() => {
      this.helper.scale.z = this.plane.scale.y;
    });

    this.toggleButton = document.getElementById('plane-visibility');

    // Add an event listener to the button
    this.toggleButton.addEventListener('click', () => {
      // Toggle the visibility property of the plane
      this.helper.visible = !this.helper.visible;
      // Update the text content of the button to reflect the new state
      this.toggleButton.textContent = this.helper.visible ? 'Hide Plane' : 'Show Plane';
    });

    this.upload_button = document.getElementById('upload-to-viewport');

    this.upload_button.addEventListener('click', () => {
      
    });
  }

  changeWindowSize(width, height){
    super.changeWindowSize(width, height);
    // this.slider.style.top = String(0.5 * height) + "px";
    // this.slider.style.width = String(0.9 * height) + "px";
    // this.slider.style.right = String(-0.40 * height) + "px";
  }

  animate(){
    if (this.rendering) {
      this.controls.update(); // Update the controls
      this.renderer.render(this.scene, this.camera); // Render the scene with the camera
    }
  }
}

export {BIEM};