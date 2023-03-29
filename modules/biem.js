import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { biem, viewport } from "../src/main.js";
import {Window} from "./window.js"
import * as dat from "dat.gui";

let biem_gui = new dat.GUI({autoPlace: false});
document.querySelector('#biem-gui').appendChild(biem_gui.domElement);

// Frequently used functions

function getIntersectionsFromMouse(event, intersectObject) {
  const canvasRect = biem.canvas.getBoundingClientRect();
  const mouseCoords = {
    x: ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1,
    y: -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1,
  };

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouseCoords, biem.camera);

  return raycaster.intersectObject(intersectObject);
}

function getPositionFromMouse(event) {
  // Get the canvas size and mouse position relative to it
  const canvasRect = biem.canvas.getBoundingClientRect();
  const canvasX = event.clientX - canvasRect.left;
  const canvasY = event.clientY - canvasRect.top;

  // Convert the mouse position to a normalized coordinate in the camera's view space
  const normalizedMousePos = new THREE.Vector2(
    (canvasX / canvasRect.width) * 2 - 1,
    -(canvasY / canvasRect.height) * 2 + 1
  );

  // Cast a ray from the camera through the normalized mouse position to the plane
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(normalizedMousePos, biem.camera);
  const intersections = raycaster.intersectObject(biem.plane);

  // If the ray intersects the plane, return the intersection point
  if (intersections.length > 0) {
    const intersectionPoint = intersections[0].point;
    return intersectionPoint;
  }
}

// Main mouse selection

var selected_plane, position;

function handlePlaneIntersections(planeIntersections) {
  const hasIntersections = planeIntersections.length > 0;

  if (hasIntersections) {
    // If there are plane intersections, disable controls and show the sphere cursor
    biem.controls.enabled = false;
    biem.sphere.visible = true;
    biem.canvas.style.cursor = "none";

    // Move the sphere cursor to the intersection point and listen for mouse events
    const intersectionPoint = planeIntersections[0].point;
    biem.sphere.position.copy(intersectionPoint);
    document.addEventListener('mousedown', onMouseDown);
  } else {
    // If there are no plane intersections, enable controls and hide the sphere cursor
    biem.controls.enabled = true;
    biem.sphere.visible = false;
    biem.canvas.style.cursor = "auto";

    // Remove all mouse event listeners
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUpAfterMouseDown);
    document.removeEventListener('mousemove', onMouseMoveAfterMouseDown);
  }
}

function handleMouseMove(event) {
  // Check if a rectangle is currently being extruded
  if (biem.helper.visible) {
    // If so, check for intersection with the extrusion plane
    const intersections = getIntersectionsFromMouse(event, biem.plane);
    handlePlaneIntersections(intersections);
  }
  // If no rectangle is being extruded and the mouse is not down
  else if (!isMouseDown) {
    selected_plane = null;
    position = 0;
    // Iterate over each rectangle to check for intersection with the mouse
    biem.planes.forEach(function (rectangle, i) {
      const intersections = getIntersectionsFromMouse(event, rectangle);

      if (intersections.length > 0) {
        // If an intersection is found, set the selected_plane and position variables
        selected_plane = rectangle;
        position = i;
      } else {
        // If no intersection, reset the color of the rectangle
        rectangle.material.color.set(0xff5555);
      }
    });
    if (selected_plane != null) {
      // If a rectangle is selected, highlight it and disable controls
      selected_plane.material.color.set(0x00ff00);
      biem.controls.enabled = false;

      // Add event listener for mouse down to start extrusion
      document.addEventListener('mousedown', handleMouseDownOnPlane);
    } else {
      // If no rectangle is selected, reset controls and remove event listeners
      biem.controls.enabled = true;

      document.removeEventListener('mousedown', handleMouseDownOnPlane);
      document.removeEventListener('mousemove', handleMouseMoveDuringExtrusion);
    }
  }
}

// Extrusion

// Variables
var isMouseDown = false;
var box;

// Event Handlers
function handleMouseDownOnPlane(event) {
  // Set mouse_down flag to true
  isMouseDown = true;

  // Listen for mouseup and mousemove events
  document.addEventListener('mouseup', onMouseUpAfterPlaneMouseDown);
  document.addEventListener('mousemove', handleMouseMoveDuringExtrusion);

  // Get mouse position and create a line at that position
  const intersections = getIntersectionsFromMouse(event, selected_plane);
  const mousePosition = intersections[0].point;
  const line = new THREE.Line();
  line.position.copy(mousePosition);
  biem.scene.add(line);

  // Set extrusion plane position and rotation
  const cameraPosition = new THREE.Vector3();
  biem.camera.getWorldPosition(cameraPosition);
  const extrusionPlane = biem.extrusion_plane;
  extrusionPlane.lookAt(new THREE.Vector3(cameraPosition.x, extrusionPlane.position.y, cameraPosition.z));
  extrusionPlane.position.copy(mousePosition);

  // Create a box mesh
  const extrusionPlaneIntersections = getIntersectionsFromMouse(event, extrusionPlane);
  const extrusionPlaneMousePosition = extrusionPlaneIntersections[0].point;
  const yOffset = extrusionPlaneMousePosition.y;
  const boxGeometry = new THREE.BoxGeometry(
    selected_plane.geometry.parameters.width, 
    yOffset - selected_plane.position.y, 
    selected_plane.geometry.parameters.height
  );
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  box = new THREE.Mesh(boxGeometry, boxMaterial);
  biem.boxes.push(box);

  // Set box position and add it to the scene
  box.position.copy(selected_plane.position);
  biem.scene.add(box);

  biem.extrusion_plane.visible = true;
}

function handleMouseMoveDuringExtrusion(event) {
  const cameraPosition = new THREE.Vector3();
  biem.camera.getWorldPosition(cameraPosition);
  biem.extrusion_plane.lookAt(new THREE.Vector3(cameraPosition.x, biem.extrusion_plane.position.y, cameraPosition.z));
  
  // Get mouse position and set box geometry and position
  const extrusion_plane_intersections = getIntersectionsFromMouse(event, biem.extrusion_plane);
  const extrusion_plane_mousePosition = extrusion_plane_intersections[0].point;
  const y_offset = extrusion_plane_mousePosition.y;
  box.geometry = new THREE.BoxGeometry(
    selected_plane.geometry.parameters.width, 
    y_offset - selected_plane.position.y, 
    selected_plane.geometry.parameters.height
  );
  box.position.set(
    selected_plane.position.x, 
    selected_plane.position.y + (y_offset - selected_plane.position.y) / 2, 
    selected_plane.position.z
  );
}

function onMouseUpAfterPlaneMouseDown(event) {
  isMouseDown = false;

  // Remove line and extrusion plane
  biem.scene.remove(biem.line);

  document.removeEventListener('mouseup', onMouseUpAfterPlaneMouseDown);
  document.removeEventListener('mousemove', handleMouseMoveDuringExtrusion);

  // Remove selected plane
  biem.scene.remove(selected_plane);
  biem.planes.splice(position, 1);
  biem.extrusion_plane.visible=false;
}

// Drawing the rectangles onto the plane

let initialMousePosition;

function onMouseDown(event) {
  initialMousePosition = getPositionFromMouse(event);
  document.addEventListener('mouseup', onMouseUpAfterMouseDown);
  document.addEventListener('mousemove', onMouseMoveAfterMouseDown);

  // Create a new plane at the initial mouse position
  const planeGeometry = new THREE.PlaneGeometry(0, 0);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff5555,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const newPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  newPlane.rotation.set(-Math.PI / 2, 0, 0);

  biem.planes.push(newPlane);
  biem.scene.add(biem.planes[biem.planes.length - 1]);
}

function onMouseMoveAfterMouseDown(event) {
  const currentMousePosition = getPositionFromMouse(event);
  const deltaX = currentMousePosition.x - initialMousePosition.x;
  const deltaY = currentMousePosition.z - initialMousePosition.z;

  const newPlane = biem.planes[biem.planes.length - 1];
  newPlane.geometry = new THREE.PlaneGeometry(Math.abs(deltaX), Math.abs(deltaY));
  newPlane.position.set(
    initialMousePosition.x + deltaX / 2,
    biem.plane.position.y + 0.00001,
    initialMousePosition.z + deltaY / 2
  );
}

function onMouseUpAfterMouseDown(event) {
  const finalMousePosition = getPositionFromMouse(event);

  const deltaX = finalMousePosition.x - initialMousePosition.x;
  const deltaY = finalMousePosition.z - initialMousePosition.z;

  const newPlane = biem.planes[biem.planes.length - 1];
  newPlane.geometry = new THREE.PlaneGeometry(Math.abs(deltaX), Math.abs(deltaY));
  newPlane.position.set(
    initialMousePosition.x + deltaX / 2,
    biem.plane.position.y + 0.00001,
    initialMousePosition.z + deltaY / 2
  );

  document.removeEventListener('mouseup', onMouseUpAfterMouseDown);
  document.removeEventListener('mousemove', onMouseMoveAfterMouseDown);
}

class BIEM extends Window {
  constructor(window) {
    super(window);

    // Add lights and helpers to the scene
    this.addLights();
    this.addAxesHelper();
    this.addPlane();
    this.addExtrusionPlane();
    this.addGridHelper();
    this.addSphere();

    // Add orbit controls to the camera
    this.addOrbitControls();

    // Initialize properties
    this.planes = [];
    this.boxes = [];

    // Add GUI controls
    this.addGuiControls();

    // Add event listeners
    this.addEventListeners();
  }

  addLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.scene.add(directionalLight);
    
    const ambientLight = new THREE.AmbientLight(0x888888);
    this.scene.add(ambientLight);
  }

  addAxesHelper() {
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);
  }

  addPlane() {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.rotation.set(-Math.PI/2, 0, 0);
    this.plane.visible = false;
    this.scene.add(this.plane);
  }
  
  addExtrusionPlane() {
    // Create a plane geometry with a large constant value
    const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
    // Create a plane material
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x808080,
      transparent: true,
      opacity: 0.5 
    });
    // Create the plane and rotate it to be horizontal
    this.extrusion_plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.extrusion_plane.visible=false;
    this.scene.add(this.extrusion_plane);
  }

  addLine() {
    
  }

  addGridHelper() {
    this.helper = new THREE.GridHelper(1, 8, 0x333333, 0x333333);
    this.helper.receiveShadow = true;
    this.scene.add(this.helper);
  }

  addSphere() {
    const sphereGeometry = new THREE.SphereGeometry(0.01, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.sphere.name = "sphere";
    this.scene.add(this.sphere);
  }

  addOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.3;
    this.camera.position.z = 1;
    this.camera.position.y = 1;
    this.controls.update();
  }

  addGuiControls() {
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
  }

  addEventListeners(){
    this.toggleButton = document.getElementById('plane-visibility');
    this.toggleButton.addEventListener('click', () => {
      // Toggle the visibility property of the plane
      // Update the text content of the button to reflect the new state
      biem.helper.visible = !biem.helper.visible;
      biem.toggleButton.textContent = biem.helper.visible ? 'Hide Plane' : 'Show Plane';
    });

    this.upload_button = document.getElementById('upload-to-viewport');
    this.upload_button.addEventListener('click', () => {
      biem.boxes.forEach(function(temp_box) {
        viewport.scene.add(temp_box.clone());
      });
    });

    document.addEventListener('mousemove', handleMouseMove );
  }

  animate(){
    if (this.rendering) {
      this.controls.update(); // Update the controls
      this.renderer.render(this.scene, this.camera); // Render the scene with the camera
    }
  }
}

export {BIEM};