import * as THREE from "three";

class Window {
  // constructor to initialize the scene, camera, and renderer
  constructor(canvas) {
    this.canvas = document.getElementById(canvas);

    this.scene = new THREE.Scene(); // create a new 3D scene
    this.camera = new THREE.PerspectiveCamera(75, 100 / 100, 0.1, 1000); // create a perspective camera
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas }); // create a WebGL renderer with the given canvas

    this.rendering = false;
		this.side=""
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
      this.renderer.render(this.scene, this.camera); // render the scene with the camera
    }
  }
}

export {Window};