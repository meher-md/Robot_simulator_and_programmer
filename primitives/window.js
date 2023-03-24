import * as THREE from "three";

class Window {
  // Constructor to initialize the scene, camera, and renderer
  constructor(canvas) { // canvas: canvasName
    this.canvas = document.getElementById(canvas);

    this.scene = new THREE.Scene(); // Create a new 3D scene
    this.camera = new THREE.PerspectiveCamera(75, 100 / 100, 0.1, 1000); // Create a perspective camera
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true }); // Create a WebGL renderer with the given canvas

    this.rendering = false; // Set the initial rendering state to false
		this.side = ""; // Initialize the side property as an empty string
  }

  // Show the canvas element
  show() {
    this.rendering = true; // Set the rendering state to true
    this.canvas.style.display = "block"; // Set the canvas display style to block
  }

  // Hide the canvas element
  hide() {
    this.rendering = false; // Set the rendering state to false
    this.canvas.style.display = "none"; // Set the canvas display style to none
  }

  // Method to animate the scene
  animate() {
    if (this.rendering) {
      this.renderer.render(this.scene, this.camera); // Render the scene with the camera
    }
  }
}

export {Window};
