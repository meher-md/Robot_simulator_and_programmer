import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { viewport } from "../src/main.js";
import {ThreeWindow} from "./window.js"
import * as dat from "dat.gui";


let biem_gui = new dat.GUI({autoPlace: false});
document.querySelector('#biem-gui').appendChild(biem_gui.domElement);


// Frequently used functions

var palette = {
  color: '#FF0000'
};
biem_gui.addColor(palette, "color");

function getIntersectionsFromMouse(event, intersectObject) {
  if (!intersectObject) {
    console.error("Invalid intersectObject passed to getIntersectionsFromMouse.");
    return [];
  }
  if (!biem.canvas) {
    console.error("Canvas is not initialized.");
    return [];
  }

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
  if (biem.helper?.visible) {
    const intersections = getIntersectionsFromMouse(event, biem.plane);
    handlePlaneIntersections(intersections);
  }
  // If no rectangle is being extruded and the mouse is not down
  else if (!isMouseDown) {
    selected_plane = null;
    position = 0;

    // Check if rectangles (biem.planes) exist and are non-empty before iterating
    if (Array.isArray(biem.planes) && biem.planes.length > 0) {
      biem.planes.forEach(function (rectangle, i) {
        const intersections = getIntersectionsFromMouse(event, rectangle);

        if (intersections.length > 0) {
          // If an intersection is found, set the selected_plane and position variables
          selected_plane = rectangle;
          position = i;

          if (selected_plane.originalColor === undefined) {
            selected_plane.originalColor = new THREE.Color(selected_plane.material.color.getHex());
          }
        } else {
          // Reset the color of the rectangle if no intersection
          rectangle.material.color.copy(rectangle.originalColor);
        }
      });

      if (selected_plane) {
        // Highlight selected rectangle and disable controls
        if (selected_plane.originalColor === undefined) {
          selected_plane.originalColor = new THREE.Color(selected_plane.material.color.getHex());
        }
        selected_plane.material.color.set(0xffffff);
        biem.controls.enabled = false;

        // Add event listener for mouse down to start extrusion
        document.addEventListener('mousedown', handleMouseDownOnPlane);
      } else {
        // Reset controls and remove event listeners if no rectangle is selected
        biem.controls.enabled = true;
        document.removeEventListener('mousedown', handleMouseDownOnPlane);
        document.removeEventListener('mousemove', handleMouseMoveDuringExtrusion);
      }
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
  const boxGeometry = new THREE.BoxGeometry(
    selected_plane.geometry.parameters.width, 
    0, 
    selected_plane.geometry.parameters.height
  );
  const boxMaterial = new THREE.MeshStandardMaterial({ color: selected_plane.originalColor });
  box = new THREE.Mesh(boxGeometry, boxMaterial);
  biem.boxes.push(box);

  // Set box position and add it to the scene
  box.position.copy(selected_plane.position);
  biem.scene.add(box);

  biem.extrusion_plane.visible = true;
}

function handleMouseMoveDuringExtrusion(event) {
  // Get the current position of the camera
  const currentCameraPosition = new THREE.Vector3();
  biem.camera.getWorldPosition(currentCameraPosition);

  // Look at the extrusion plane from the camera
  biem.extrusion_plane.lookAt(new THREE.Vector3(currentCameraPosition.x, biem.extrusion_plane.position.y, currentCameraPosition.z));

  // Get the mouse position and calculate the y-offset of the extrusion
  const extrusion_plane_intersections = getIntersectionsFromMouse(event, biem.extrusion_plane);
  const extrusion_plane_mousePosition = (extrusion_plane_intersections.length > 0) ? extrusion_plane_intersections[0].point : new Vector3(0, 0, 0);
  const y_offset = extrusion_plane_mousePosition.y;

  // Set the geometry and position of the box to create the extrusion
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
    color: palette.color,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const newPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  newPlane.originalColor = new THREE.Color(newPlane.material.color.getHex());
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

class BIEM extends ThreeWindow {
  constructor(window) {   
    super(window);

    // Initialize canvas
    this.canvas = this.window.querySelector("canvas.three-canvas");
    if (!this.canvas) {
      console.error("Canvas not found in BIEM window.");
    }
    // Add lights and helpers to the scene
    this.addLights();
    // this.addAxesHelper();
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

    // -------------------------------POINT CLOUD CODE
        // Scene setup
    this.pointCloudGroup = new THREE.Group();
    this.pointCloudGroup.name = "PointClouds";
    this.scene.add(this.pointCloudGroup);

    this.pointClouds = [];
    this.helper = new THREE.GridHelper(1, 8, 0x6ac36d, 0x333333);
    this.scene.add(this.helper);
    this.addPointCloudGuiControls();
    this.addPointCloudEventListeners();
    this.loadPCDPointCloud = this.loadPCDPointCloud.bind(this);

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
    this.plane.scale.x=2;
    this.plane.scale.y=2;
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
    // this.scene.add(this.extrusion_plane);
  }
  
  addLine() {
    
  }
  
  addGridHelper() {
    this.helper = new THREE.GridHelper(1, 8, 0x6ac36d, 0x333333);
    this.helper.receiveShadow = true;
    this.helper.scale.x=2;
    this.helper.scale.z=2;
    this.scene.add(this.helper);
  }

  addSphere() {
    const sphereGeometry = new THREE.SphereGeometry(0.01, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
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

    biem_gui.add(this.plane.scale, "x", 2, 10, 0.1).name("Scale X").onChange(() => {
      this.helper.scale.x = this.plane.scale.x;
    });

    biem_gui.add(this.plane.scale, "y", 2, 10, 0.1).name("Scale Y").onChange(() => {
      this.helper.scale.z = this.plane.scale.y;
    });
  }

  addEventListeners(){
    this.toggleButton = document.getElementById('plane-visibility');
    this.toggleButton.addEventListener('click', () => {
      // Toggle the visibility property of the plane
      // Update the text content of the button to reflect the new state
      biem.helper.visible = !biem.helper.visible;
      biem.toggleButton.textContent = biem.helper.visible ? 'Extrude' : 'Draw';
    });

    this.upload_button = document.getElementById('upload-to-viewport');
    this.upload_button.addEventListener('click', () => {
      biem.boxes.forEach(function(temp_box) {
        viewport.scene.add(temp_box.clone());
      });
    });

    document.addEventListener('mousemove', handleMouseMove );
  }

  // ------------------------------------------------------------------   POINT CLOUD METHODS
  loadPCDPointCloud(data, name = "PointCloud") {
    if (Array.isArray(data)) {
      // **Handling JSON Data**
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const colors = [];
  
      data.forEach(point => {
        // Scale the points by 0.001
        vertices.push(point.x * 0.001, point.y * 0.001, point.z * 0.001);
        if (point.color) {
          colors.push(point.color.r, point.color.g, point.color.b);
        } else {
          colors.push(1, 1, 1);
        }
      });
  
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });
  
      const pointCloud = new THREE.Points(geometry, material);
      pointCloud.name = name;
      this.pointCloudGroup.add(pointCloud);
      this.pointClouds.push(pointCloud);
    } else if (data instanceof THREE.Points) {
      // **Handling PCDLoader's PointCloud Object**
      data.name = name;
      data.scale.set(0.001, 0.001, 0.001); // Scale the entire point cloud
      this.pointCloudGroup.add(data);
      this.pointClouds.push(data);
    } else {
      console.error("Unsupported data type for loadPCDPointCloud:", data);
      return;
    }
  
    this.updatePointCloudGui();
  }
  

  addPointCloudGuiControls() {
    this.pointCloudFolder = biem_gui.addFolder('Point Clouds');
    this.pointCloudFolder.open();

    this.pointCloudFolder.add(this, 'togglePointCloudVisibility').name('Toggle All Visibility');
  }

  updatePointCloudGui() {
    const controllers = this.pointCloudFolder.__controllers.slice();
    controllers.forEach(controller => this.pointCloudFolder.remove(controller));

    this.pointClouds.forEach(pc => {
      const folder = this.pointCloudFolder.addFolder(pc.name);
      folder.add(pc, 'visible').name('Visible');
      folder.add({ delete: () => this.deletePointCloud(pc) }, 'delete').name('Delete');
    });
  }

  deletePointCloud(pointCloud) {
    this.pointCloudGroup.remove(pointCloud);
    const index = this.pointClouds.indexOf(pointCloud);
    if (index > -1) this.pointClouds.splice(index, 1);
    this.updatePointCloudGui();
  }

  togglePointCloudVisibility() {
    const visibility = !this.pointClouds[0]?.visible;
    this.pointClouds.forEach(pc => pc.visible = visibility);
  }

  addPointCloudEventListeners() {
    document.addEventListener('click', this.onPointCloudClick.bind(this));
  }

  onPointCloudClick(event) {
    if (!this.pointClouds.length) {
      console.warn("No point clouds available for intersection.");
      return;
  }
    const intersects = getIntersectionsFromMouse(event, this.pointClouds);
    if (intersects.length) {
        const intersected = intersects[0].object;
        this.previewPointCloud(intersected);
    } else {
        this.hidePointCloudPreview();
    }
}

  previewPointCloud(pointCloud) {
    if (this.currentPreview) this.currentPreview.material.size = 0.05;
    pointCloud.material.size = 0.1;
    this.currentPreview = pointCloud;
  }

  hidePointCloudPreview() {
    if (this.currentPreview) this.currentPreview.material.size = 0.05;
    this.currentPreview = null;
  }
  animate(){
    if (this.rendering) {
      this.controls.update(); // Update the controls
      this.renderer.render(this.scene, this.camera); // Render the scene with the camera
    }
  }
}

export {BIEM};