import * as THREE from "three";

class Window {
  // Constructor to initialize the scene, camera, and renderer
  constructor(window) { // canvas: canvasName
    this.window = document.getElementById(window);

		this.side = ""; // Initialize the side property as an empty string
    this.hide();
  }

  // Show the canvas element
  show() {
    this.rendering = true; // Set the rendering state to true
    this.window.style.display = "block"; // Set the window display style to block
  }

  // Hide the canvas element
  hide() {
    this.rendering = false; // Set the rendering state to false
    this.window.style.display = "none"; // Set the window display style to none
  }

  changeWindowSize(width, height) {
    this.window.width = width;
    this.window.height = height;
  }

  // function to move a window
  moveWindow(left, top) {
    this.window.style.left = left + "px";
    this.window.style.top = top + "px";
  }

  animate(){  }
}

class ThreeWindow extends Window {
  constructor(window){
    super(window);
    this.canvas = this.window.querySelector("canvas.three-canvas");

    this.scene = new THREE.Scene(); // Create a new 3D scene
    this.camera = new THREE.PerspectiveCamera(75, 100 / 100, 0.1, 1000); // Create a perspective camera
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true}); // Create a WebGL renderer with the given canvas

    this.rendering = false; // Set the initial rendering state to false
  }

  changeWindowSize(width, height){
    super.changeWindowSize(width, height);
  
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // Method to animate the scene
  animate() {
    if (this.rendering) {
      this.renderer.render(this.scene, this.camera); // Render the scene with the camera
    }
  }
}

export {Window, ThreeWindow};