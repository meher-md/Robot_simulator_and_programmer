import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Light } from "/modules/light.js";
import { Window } from "/modules/window.js";

class Box extends Window {
  // constructor to initialize the scene, camera, and renderer
  constructor(color, canvas) {
    super(canvas);
    const geometry = new THREE.BoxGeometry(1, 1, 1); // create a box geometry with size 1x1x1
    const material = new THREE.MeshStandardMaterial({ color: color }); // create a basic mesh material with given color

    this.cube = new THREE.Mesh(geometry, material); // create a mesh from the geometry and material
    this.scene.add(this.cube); // add the cube to the scene

    const ambientLight = new THREE.AmbientLight(0x505050); // soft white light
    this.scene.add(ambientLight);

    this.light = new Light(this.scene, 0xffffff);
    this.light.changePosition(1, 1, 0);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.camera.position.z = 5; // position the camera 5 units away along the z-axis
    this.controls.update();
  }

  show() {
    this.rendering = true;
    this.canvas.style.display = "block";
  }
  hide() {
    this.rendering = false;
    this.canvas.style.display = "none";
  }

  // method to animate the scene
  animate() {
    if (this.rendering) {
      this.cube.rotation.x += 0.01; // increment the x-axis rotation of the cube by 0.01
      this.cube.rotation.y += 0.01; // increment the y-axis rotation of the cube by 0.01
      
      this.controls.update();

      this.renderer.render(this.scene, this.camera); // render the scene with the camera
    }
  }
}

export {Box};